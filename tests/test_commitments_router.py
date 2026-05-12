"""http tests for the /commitments router.

exercises every gate: signature -> authority -> schema -> policy.
"""

from __future__ import annotations

import json
from typing import Any

from server.identity.keys import generate_keypair, sign
from server.models import Policy, Principal


def _canonical(envelope: dict[str, Any]) -> bytes:
    body = {k: envelope[k] for k in ("id", "parent_id", "timestamp", "type", "emitted_by", "payload")}
    return json.dumps(
        body, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False
    ).encode("utf-8")


def _signed_envelope(
    *, kp_priv: bytes, principal_id: str, type_: str, payload: dict, parent_id: str | None = None
) -> dict[str, Any]:
    env = {
        "id": "evt_test_1",
        "parent_id": parent_id,
        "timestamp": "2026-05-12T00:00:00.000000Z",
        "type": type_,
        "emitted_by": principal_id,
        "payload": payload,
    }
    env["signature"] = sign(_canonical(env), kp_priv).hex()
    return env


def _make_principal(db_session, capabilities: list[str] | None = None) -> tuple[Principal, bytes]:
    priv, pub = generate_keypair()
    p = Principal(org="acme", public_key=pub.hex(), capabilities=capabilities or [])
    db_session.add(p)
    db_session.commit()
    db_session.refresh(p)
    return p, priv


def test_commit_offer_happy_path(client, db_session):
    p, priv = _make_principal(db_session, capabilities=["offer"])
    env = _signed_envelope(
        kp_priv=priv,
        principal_id=p.id,
        type_="offer",
        payload={"summary": "first offer", "terms": {}},
    )

    res = client.post("/commitments", json=env)
    assert res.status_code == 201, res.text
    body = res.json()
    assert body["status"] == "active"
    assert body["type"] == "offer"
    assert body["decision"]["action"] == "allow"
    assert body["decision"]["applied"] == []


def test_commit_rejects_bad_signature(client, db_session):
    p, _ = _make_principal(db_session, capabilities=["offer"])
    _, wrong_priv = generate_keypair()  # signed by the wrong key
    env = _signed_envelope(
        kp_priv=wrong_priv,
        principal_id=p.id,
        type_="offer",
        payload={"summary": "x", "terms": {}},
    )
    res = client.post("/commitments", json=env)
    assert res.status_code == 401
    assert "signature" in res.json()["detail"].lower()


def test_commit_rejects_unknown_principal(client):
    priv, _ = generate_keypair()
    env = _signed_envelope(
        kp_priv=priv,
        principal_id="does-not-exist",
        type_="offer",
        payload={"summary": "x", "terms": {}},
    )
    res = client.post("/commitments", json=env)
    assert res.status_code == 401


def test_commit_rejects_when_principal_lacks_capability(client, db_session):
    # principal has no capabilities; offer should be refused
    p, priv = _make_principal(db_session, capabilities=[])
    env = _signed_envelope(
        kp_priv=priv,
        principal_id=p.id,
        type_="offer",
        payload={"summary": "x", "terms": {}},
    )
    res = client.post("/commitments", json=env)
    assert res.status_code == 403
    body = res.json()
    assert body["detail"]["policy"] == "authority"
    assert "offer" in body["detail"]["reason"]


def test_commit_rejects_invalid_payload(client, db_session):
    p, priv = _make_principal(db_session, capabilities=["offer"])
    env = _signed_envelope(
        kp_priv=priv,
        principal_id=p.id,
        type_="offer",
        payload={"terms": {}},  # missing required `summary`
    )
    res = client.post("/commitments", json=env)
    assert res.status_code == 422
    assert "summary" in res.text.lower() or "required" in res.text.lower()


def test_commit_rejects_unknown_commitment_type(client, db_session):
    p, priv = _make_principal(db_session, capabilities=["bogus_type"])
    env = _signed_envelope(
        kp_priv=priv,
        principal_id=p.id,
        type_="bogus_type",
        payload={},
    )
    res = client.post("/commitments", json=env)
    assert res.status_code == 422


def test_commit_blocked_by_policy(client, db_session):
    p, priv = _make_principal(db_session, capabilities=["offer"])
    db_session.add(
        Policy(
            name="spend cap",
            scope_kind="global",
            predicate_name="spend_over_cap",
            params={"cap": 1000},
            action="block",
            enabled=True,
        )
    )
    db_session.commit()
    env = _signed_envelope(
        kp_priv=priv,
        principal_id=p.id,
        type_="offer",
        payload={"summary": "big deal", "terms": {"fee_total_usd": 5000}},
    )
    res = client.post("/commitments", json=env)
    assert res.status_code == 403
    body = res.json()
    assert body["detail"]["policy"] == "spend cap"
    assert body["detail"]["action"] == "block"


def test_commit_flagged_but_persisted(client, db_session):
    p, priv = _make_principal(db_session, capabilities=["offer"])
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
    env = _signed_envelope(
        kp_priv=priv,
        principal_id=p.id,
        type_="offer",
        payload={"summary": "long deal", "terms": {"term_months": 24}},
    )
    res = client.post("/commitments", json=env)
    assert res.status_code == 201
    body = res.json()
    assert body["status"] == "flagged"
    assert body["decision"]["action"] == "flag"
    assert body["decision"]["applied"][0]["policy_name"] == "term cap"


def test_commit_authority_check_runs_before_schema(client, db_session):
    """if a principal lacks capability, we shouldn't bother loading the schema —
    authority is a stricter gate, and the 403 should fire even when the payload
    would have been invalid anyway."""
    p, priv = _make_principal(db_session, capabilities=[])
    env = _signed_envelope(
        kp_priv=priv,
        principal_id=p.id,
        type_="offer",
        payload={},  # also invalid, but should never be reached
    )
    res = client.post("/commitments", json=env)
    assert res.status_code == 403


def test_commit_hits30d_increments_on_policy_fire(client, db_session):
    p, priv = _make_principal(db_session, capabilities=["offer"])
    pol = Policy(
        name="term cap",
        scope_kind="global",
        predicate_name="term_months_over_cap",
        params={"cap": 12},
        action="flag",
        enabled=True,
    )
    db_session.add(pol)
    db_session.commit()
    db_session.refresh(pol)
    before = pol.hits30d
    env = _signed_envelope(
        kp_priv=priv,
        principal_id=p.id,
        type_="offer",
        payload={"summary": "x", "terms": {"term_months": 24}},
    )
    res = client.post("/commitments", json=env)
    assert res.status_code == 201
    db_session.refresh(pol)
    assert pol.hits30d == before + 1
