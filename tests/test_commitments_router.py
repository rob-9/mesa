"""http tests for the /commitments router.

exercises every gate: signature -> authority -> schema -> policy.
"""

from __future__ import annotations

from typing import Any

# import the production canonicalizer so router tests cannot diverge from
# the bytes the server actually verifies.
from server.events.envelope import canonical_bytes
from server.identity.keys import generate_keypair, sign
from server.models import Deliberation, Policy, Principal


def _signed_envelope(
    *,
    kp_priv: bytes,
    principal_id: str,
    type_: str,
    payload: dict,
    deliberation_id: str,
    parent_id: str | None = None,
) -> dict[str, Any]:
    env = {
        "id": "evt_test_1",
        "parent_id": parent_id,
        "timestamp": "2026-05-12T00:00:00.000000Z",
        "type": type_,
        "emitted_by": principal_id,
        "deliberation_id": deliberation_id,
        "payload": payload,
    }
    env["signature"] = sign(canonical_bytes(env), kp_priv).hex()
    return env


def _make_principal(db_session, capabilities: list[str] | None = None) -> tuple[Principal, bytes]:
    priv, pub = generate_keypair()
    p = Principal(org="acme", public_key=pub.hex(), capabilities=capabilities or [])
    db_session.add(p)
    db_session.commit()
    db_session.refresh(p)
    return p, priv


def _make_deliberation(db_session, status: str = "open") -> str:
    d = Deliberation(title="test deliberation", status=status)
    db_session.add(d)
    db_session.commit()
    db_session.refresh(d)
    return d.id


def test_commit_offer_happy_path(client, db_session):
    p, priv = _make_principal(db_session, capabilities=["offer"])
    did = _make_deliberation(db_session)
    env = _signed_envelope(
        deliberation_id=did,
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


def test_commit_rejects_non_hex_signature(client, db_session):
    p, priv = _make_principal(db_session, capabilities=["offer"])
    did = _make_deliberation(db_session)
    env = _signed_envelope(
        deliberation_id=did,
        kp_priv=priv,
        principal_id=p.id,
        type_="offer",
        payload={"summary": "x", "terms": {}},
    )
    env["signature"] = "zz" * 64  # right length, not hex
    res = client.post("/commitments", json=env)
    # malformed input -> 422 validation, not 401 auth
    assert res.status_code == 422


def test_commit_rejects_bad_signature(client, db_session):
    p, _ = _make_principal(db_session, capabilities=["offer"])
    did = _make_deliberation(db_session)
    _, wrong_priv = generate_keypair()  # signed by the wrong key
    env = _signed_envelope(
        deliberation_id=did,
        kp_priv=wrong_priv,
        principal_id=p.id,
        type_="offer",
        payload={"summary": "x", "terms": {}},
    )
    res = client.post("/commitments", json=env)
    assert res.status_code == 401
    assert res.json()["detail"]["code"] == "invalid_signature"


def test_commit_rejects_unknown_principal(client):
    priv, _ = generate_keypair()
    env = _signed_envelope(
        deliberation_id="d_sentinel",  # never reached; principal lookup fails first
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
    did = _make_deliberation(db_session)
    env = _signed_envelope(
        deliberation_id=did,
        kp_priv=priv,
        principal_id=p.id,
        type_="offer",
        payload={"summary": "x", "terms": {}},
    )
    res = client.post("/commitments", json=env)
    assert res.status_code == 403
    body = res.json()
    assert body["detail"]["code"] == "authority_denied"
    assert "offer" in body["detail"]["message"]


def test_commit_rejects_invalid_payload(client, db_session):
    p, priv = _make_principal(db_session, capabilities=["offer"])
    did = _make_deliberation(db_session)
    env = _signed_envelope(
        deliberation_id=did,
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
    did = _make_deliberation(db_session)
    env = _signed_envelope(
        deliberation_id=did,
        kp_priv=priv,
        principal_id=p.id,
        type_="bogus_type",
        payload={},
    )
    res = client.post("/commitments", json=env)
    assert res.status_code == 422


def test_commit_blocked_by_policy(client, db_session):
    p, priv = _make_principal(db_session, capabilities=["offer"])
    did = _make_deliberation(db_session)
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
        deliberation_id=did,
        kp_priv=priv,
        principal_id=p.id,
        type_="offer",
        payload={"summary": "big deal", "terms": {"fee_total_usd": 5000}},
    )
    res = client.post("/commitments", json=env)
    assert res.status_code == 403
    body = res.json()
    assert body["detail"]["code"] == "policy_blocked"
    assert body["detail"]["policy_name"] == "spend cap"


def test_commit_route_persists_as_flagged_with_route_to(client, db_session):
    p, priv = _make_principal(db_session, capabilities=["offer"])
    did = _make_deliberation(db_session)
    db_session.add(
        Policy(
            name="needs legal",
            scope_kind="global",
            predicate_name="term_months_over_cap",
            params={"cap": 12},
            action="route",
            route_to="legal-bot",
            enabled=True,
        )
    )
    db_session.commit()
    env = _signed_envelope(
        deliberation_id=did,
        kp_priv=priv,
        principal_id=p.id,
        type_="offer",
        payload={"summary": "long deal", "terms": {"term_months": 24}},
    )
    res = client.post("/commitments", json=env)
    assert res.status_code == 201
    body = res.json()
    assert body["status"] == "flagged"
    assert body["decision"]["action"] == "route"
    assert body["decision"]["applied"][0]["route_to"] == "legal-bot"


def test_commit_flagged_but_persisted(client, db_session):
    p, priv = _make_principal(db_session, capabilities=["offer"])
    did = _make_deliberation(db_session)
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
        deliberation_id=did,
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
    did = _make_deliberation(db_session)
    env = _signed_envelope(
        deliberation_id=did,
        kp_priv=priv,
        principal_id=p.id,
        type_="offer",
        payload={},  # also invalid, but should never be reached
    )
    res = client.post("/commitments", json=env)
    assert res.status_code == 403


def test_commit_hits30d_increments_even_when_blocked(client, db_session):
    """blocked requests must still bump hits30d — the dashboard counts
    every time a rule fires, not just when it permits a write."""
    p, priv = _make_principal(db_session, capabilities=["offer"])
    did = _make_deliberation(db_session)
    pol = Policy(
        name="spend cap",
        scope_kind="global",
        predicate_name="spend_over_cap",
        params={"cap": 1000},
        action="block",
        enabled=True,
    )
    db_session.add(pol)
    db_session.commit()
    db_session.refresh(pol)
    before = pol.hits30d
    env = _signed_envelope(
        deliberation_id=did,
        kp_priv=priv,
        principal_id=p.id,
        type_="offer",
        payload={"summary": "big deal", "terms": {"fee_total_usd": 5000}},
    )
    res = client.post("/commitments", json=env)
    assert res.status_code == 403
    db_session.expire(pol)
    db_session.refresh(pol)
    assert pol.hits30d == before + 1


def test_commit_rejects_unknown_deliberation(client, db_session):
    p, priv = _make_principal(db_session, capabilities=["offer"])
    env = _signed_envelope(
        deliberation_id="does-not-exist",
        kp_priv=priv,
        principal_id=p.id,
        type_="offer",
        payload={"summary": "x", "terms": {}},
    )
    res = client.post("/commitments", json=env)
    assert res.status_code == 422
    assert res.json()["detail"]["code"] == "unknown_deliberation"


def test_commit_rejects_closed_deliberation(client, db_session):
    p, priv = _make_principal(db_session, capabilities=["offer"])
    did = _make_deliberation(db_session, status="closed")
    env = _signed_envelope(
        deliberation_id=did,
        kp_priv=priv,
        principal_id=p.id,
        type_="offer",
        payload={"summary": "x", "terms": {}},
    )
    res = client.post("/commitments", json=env)
    assert res.status_code == 403
    assert res.json()["detail"]["code"] == "deliberation_closed"


def test_commit_appears_in_deliberation_detail(client, db_session):
    p, priv = _make_principal(db_session, capabilities=["offer"])
    did = _make_deliberation(db_session)
    env = _signed_envelope(
        deliberation_id=did,
        kp_priv=priv,
        principal_id=p.id,
        type_="offer",
        payload={"summary": "x", "terms": {}},
    )
    res = client.post("/commitments", json=env)
    assert res.status_code == 201

    detail = client.get(f"/deliberations/{did}").json()
    assert len(detail["commitments"]) == 1
    assert detail["commitments"][0]["type"] == "offer"


def test_commit_hits30d_increments_on_policy_fire(client, db_session):
    p, priv = _make_principal(db_session, capabilities=["offer"])
    did = _make_deliberation(db_session)
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
        deliberation_id=did,
        kp_priv=priv,
        principal_id=p.id,
        type_="offer",
        payload={"summary": "x", "terms": {"term_months": 24}},
    )
    res = client.post("/commitments", json=env)
    assert res.status_code == 201
    db_session.refresh(pol)
    assert pol.hits30d == before + 1
