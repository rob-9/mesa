"""end-to-end sdk tests for the commitments namespace.

drives the full flow: generate keypair, register principal, grant capability,
sign envelope, POST /commitments. exercises the authority + policy gate
through the actual server handlers via httpx ASGITransport+TestClient.
"""

from __future__ import annotations

import pytest

from mesa_sdk import Commitment, Envelope, Keypair, MesaClient
from mesa_sdk.errors import BadRequest, Unauthorized
from server.models import Policy


def _register(client: MesaClient, capabilities: list[str]) -> tuple[Keypair, str]:
    kp = Keypair.generate()
    p = client.principals.create(org="acme", public_key=kp.public_key_hex)
    if capabilities:
        client.principals.set_capabilities(p.id, capabilities)
    return kp, p.id


def test_commitments_create_happy_path(sdk_client: MesaClient):
    kp, principal_id = _register(sdk_client, capabilities=["offer"])
    env = Envelope(
        type="offer",
        emitted_by=principal_id,
        payload={"summary": "first offer", "terms": {}},
    ).sign(kp)
    c = sdk_client.commitments.create(env)
    assert isinstance(c, Commitment)
    assert c.type == "offer"
    assert c.status == "active"
    assert c.decision.action == "allow"
    assert c.decision.applied == []


def test_commitments_create_raises_unauthorized_on_bad_signature(sdk_client: MesaClient):
    kp, principal_id = _register(sdk_client, capabilities=["offer"])
    env = Envelope(
        type="offer",
        emitted_by=principal_id,
        payload={"summary": "x", "terms": {}},
    ).sign(kp)
    # tamper the signature after signing
    env["signature"] = "ab" * 64
    with pytest.raises(Unauthorized):
        sdk_client.commitments.create(env)


def test_commitments_create_raises_bad_request_on_missing_capability(
    sdk_client: MesaClient,
):
    # principal registered with no capabilities -> 403 -> BadRequest in sdk
    kp, principal_id = _register(sdk_client, capabilities=[])
    env = Envelope(
        type="offer",
        emitted_by=principal_id,
        payload={"summary": "x", "terms": {}},
    ).sign(kp)
    with pytest.raises(BadRequest) as exc:
        sdk_client.commitments.create(env)
    assert exc.value.status_code == 403


def test_commitments_create_raises_bad_request_on_schema_failure(sdk_client: MesaClient):
    kp, principal_id = _register(sdk_client, capabilities=["offer"])
    env = Envelope(
        type="offer",
        emitted_by=principal_id,
        payload={"terms": {}},  # missing required `summary`
    ).sign(kp)
    with pytest.raises(BadRequest) as exc:
        sdk_client.commitments.create(env)
    assert exc.value.status_code == 422


def test_commitments_create_returns_flagged_when_policy_fires(
    sdk_client: MesaClient, db_session
):
    db_session.add(
        Policy(
            name="term cap",
            scope_kind="global",
            predicate_name="term_months_over_cap",
            params={"cap": 12},
            action="flag",
            enabled=True,
        )
    )
    db_session.commit()
    kp, principal_id = _register(sdk_client, capabilities=["offer"])
    env = Envelope(
        type="offer",
        emitted_by=principal_id,
        payload={"summary": "long deal", "terms": {"term_months": 24}},
    ).sign(kp)
    c = sdk_client.commitments.create(env)
    assert c.status == "flagged"
    assert c.decision.action == "flag"
    assert c.decision.applied[0]["policy_name"] == "term cap"


def test_set_capabilities_round_trip(sdk_client: MesaClient):
    kp = Keypair.generate()
    p = sdk_client.principals.create(org="acme", public_key=kp.public_key_hex)
    assert p.capabilities == []
    updated = sdk_client.principals.set_capabilities(p.id, ["offer", "counter"])
    assert updated.capabilities == ["offer", "counter"]
    refetched = sdk_client.principals.get(p.id)
    assert refetched.capabilities == ["offer", "counter"]
