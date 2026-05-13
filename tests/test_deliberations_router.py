"""http tests for /deliberations CRUD + turn append."""

from __future__ import annotations

from typing import Any

from server.events.envelope import canonical_bytes
from server.identity.keys import generate_keypair, sign
from server.models import Principal


def _principal(db_session, **kw) -> tuple[Principal, bytes]:
    priv, pub = generate_keypair()
    p = Principal(org=kw.get("org", "acme"), public_key=pub.hex(), capabilities=[])
    db_session.add(p)
    db_session.commit()
    db_session.refresh(p)
    return p, priv


def _signed_turn(*, kp_priv: bytes, principal_id: str, content: str) -> dict[str, Any]:
    env = {
        "id": "evt_t",
        "parent_id": None,
        "timestamp": "2026-05-13T00:00:00.000000Z",
        "type": "turn",
        "emitted_by": principal_id,
        "payload": {"content": content},
    }
    env["signature"] = sign(canonical_bytes(env), kp_priv).hex()
    return env


def test_create_deliberation_defaults(client):
    res = client.post("/deliberations", json={"title": "Q4 license deal"})
    assert res.status_code == 201
    body = res.json()
    assert body["title"] == "Q4 license deal"
    assert body["status"] == "open"
    assert body["stage"] == "offer"
    assert body["counterparty_slug"] is None
    assert body["id"]


def test_create_deliberation_with_optional_fields(client):
    res = client.post(
        "/deliberations",
        json={
            "title": "Q4 deal",
            "counterparty_slug": "publisher-co",
            "stage": "scope",
        },
    )
    assert res.status_code == 201
    body = res.json()
    assert body["counterparty_slug"] == "publisher-co"
    assert body["stage"] == "scope"


def test_get_deliberation(client):
    created = client.post("/deliberations", json={"title": "d1"}).json()
    res = client.get(f"/deliberations/{created['id']}")
    assert res.status_code == 200
    body = res.json()
    assert body["id"] == created["id"]
    assert body["turns"] == []
    assert body["commitments"] == []


def test_get_deliberation_not_found(client):
    res = client.get("/deliberations/" + "0" * 32)
    assert res.status_code == 404


def test_list_deliberations(client):
    client.post("/deliberations", json={"title": "a"})
    client.post("/deliberations", json={"title": "b"})
    res = client.get("/deliberations")
    assert res.status_code == 200
    titles = [d["title"] for d in res.json()]
    assert titles == ["a", "b"]  # created_at order


def test_list_deliberations_status_filter(client):
    open_d = client.post("/deliberations", json={"title": "open"}).json()
    closed_d = client.post("/deliberations", json={"title": "closed"}).json()
    # close one directly via PATCH
    client.patch(f"/deliberations/{closed_d['id']}", json={"status": "closed"})

    open_only = client.get("/deliberations?status=open").json()
    assert {d["id"] for d in open_only} == {open_d["id"]}

    closed_only = client.get("/deliberations?status=closed").json()
    assert {d["id"] for d in closed_only} == {closed_d["id"]}


def test_patch_deliberation_close(client):
    d = client.post("/deliberations", json={"title": "x"}).json()
    res = client.patch(f"/deliberations/{d['id']}", json={"status": "closed"})
    assert res.status_code == 200
    assert res.json()["status"] == "closed"


def test_patch_deliberation_rejects_invalid_status(client):
    d = client.post("/deliberations", json={"title": "x"}).json()
    res = client.patch(f"/deliberations/{d['id']}", json={"status": "bogus"})
    assert res.status_code == 422


def test_create_rejects_blank_title(client):
    res = client.post("/deliberations", json={"title": "   "})
    assert res.status_code == 422


# ─── turn append ───────────────────────────────────────────────────────────


def test_append_turn_happy_path(client, db_session):
    p, priv = _principal(db_session)
    d = client.post("/deliberations", json={"title": "x"}).json()
    env = _signed_turn(kp_priv=priv, principal_id=p.id, content="opening pitch")
    res = client.post(f"/deliberations/{d['id']}/turns", json=env)
    assert res.status_code == 201, res.text
    body = res.json()
    assert body["content"] == "opening pitch"
    assert body["index"] == 0
    assert body["speaker_id"] == p.id


def test_append_turn_monotonic_index(client, db_session):
    p, priv = _principal(db_session)
    d = client.post("/deliberations", json={"title": "x"}).json()
    for i, content in enumerate(["a", "b", "c"]):
        env = _signed_turn(kp_priv=priv, principal_id=p.id, content=content)
        res = client.post(f"/deliberations/{d['id']}/turns", json=env)
        assert res.status_code == 201
        assert res.json()["index"] == i


def test_append_turn_rejects_bad_signature(client, db_session):
    p, _ = _principal(db_session)
    _, wrong_priv = generate_keypair()
    d = client.post("/deliberations", json={"title": "x"}).json()
    env = _signed_turn(kp_priv=wrong_priv, principal_id=p.id, content="x")
    res = client.post(f"/deliberations/{d['id']}/turns", json=env)
    assert res.status_code == 401


def test_append_turn_rejects_unknown_deliberation(client, db_session):
    p, priv = _principal(db_session)
    env = _signed_turn(kp_priv=priv, principal_id=p.id, content="x")
    res = client.post(f"/deliberations/{'0' * 32}/turns", json=env)
    assert res.status_code == 404


def test_append_turn_rejects_closed_deliberation(client, db_session):
    p, priv = _principal(db_session)
    d = client.post("/deliberations", json={"title": "x"}).json()
    client.patch(f"/deliberations/{d['id']}", json={"status": "closed"})
    env = _signed_turn(kp_priv=priv, principal_id=p.id, content="x")
    res = client.post(f"/deliberations/{d['id']}/turns", json=env)
    assert res.status_code == 403
    assert res.json()["detail"]["code"] == "deliberation_closed"


def test_append_turn_rejects_wrong_envelope_type(client, db_session):
    p, priv = _principal(db_session)
    d = client.post("/deliberations", json={"title": "x"}).json()
    env = {
        "id": "evt_t",
        "parent_id": None,
        "timestamp": "2026-05-13T00:00:00.000000Z",
        "type": "offer",  # wrong type for /turns
        "emitted_by": p.id,
        "payload": {"content": "x"},
    }
    env["signature"] = sign(canonical_bytes(env), priv).hex()
    res = client.post(f"/deliberations/{d['id']}/turns", json=env)
    assert res.status_code == 422
    assert res.json()["detail"]["code"] == "wrong_envelope_type"


def test_append_turn_rejects_empty_content(client, db_session):
    p, priv = _principal(db_session)
    d = client.post("/deliberations", json={"title": "x"}).json()
    env = _signed_turn(kp_priv=priv, principal_id=p.id, content="")
    res = client.post(f"/deliberations/{d['id']}/turns", json=env)
    # empty content fails schema validation (minLength: 1)
    assert res.status_code == 422


def test_get_deliberation_includes_turns_in_index_order(client, db_session):
    p, priv = _principal(db_session)
    d = client.post("/deliberations", json={"title": "x"}).json()
    for content in ["first", "second", "third"]:
        env = _signed_turn(kp_priv=priv, principal_id=p.id, content=content)
        client.post(f"/deliberations/{d['id']}/turns", json=env)
    detail = client.get(f"/deliberations/{d['id']}").json()
    assert [t["content"] for t in detail["turns"]] == ["first", "second", "third"]
    assert [t["index"] for t in detail["turns"]] == [0, 1, 2]
