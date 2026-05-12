"""http tests for the /principals router.
covers create (happy path, invalid hex, wrong length, duplicate), get (found
and not found), and list. uses the transactional rollback fixture from conftest.
"""

from server.identity.keys import generate_keypair


def _hex_key() -> str:
    _, pk = generate_keypair()
    return pk.hex()


def test_create_principal(client):
    res = client.post("/principals", json={"org": "acme", "public_key": _hex_key()})
    assert res.status_code == 201
    body = res.json()
    assert body["org"] == "acme"
    assert len(body["id"]) == 32
    assert "created_at" in body


def test_create_rejects_invalid_hex(client):
    res = client.post(
        "/principals",
        json={"org": "acme", "public_key": "z" * 64},
    )
    assert res.status_code == 422


def test_create_rejects_wrong_length(client):
    res = client.post(
        "/principals",
        json={"org": "acme", "public_key": "ab" * 10},
    )
    assert res.status_code == 422


def test_create_rejects_duplicate_public_key(client):
    pk = _hex_key()
    first = client.post("/principals", json={"org": "acme", "public_key": pk})
    assert first.status_code == 201
    second = client.post("/principals", json={"org": "other", "public_key": pk})
    assert second.status_code == 409


def test_get_principal(client):
    created = client.post(
        "/principals", json={"org": "acme", "public_key": _hex_key()}
    ).json()
    res = client.get(f"/principals/{created['id']}")
    assert res.status_code == 200
    assert res.json()["id"] == created["id"]


def test_get_principal_not_found(client):
    res = client.get("/principals/" + "0" * 32)
    assert res.status_code == 404


def test_list_principals(client):
    client.post("/principals", json={"org": "a", "public_key": _hex_key()})
    client.post("/principals", json={"org": "b", "public_key": _hex_key()})
    res = client.get("/principals")
    assert res.status_code == 200
    assert len(res.json()) == 2


def test_new_principal_has_empty_capabilities(client):
    created = client.post(
        "/principals", json={"org": "acme", "public_key": _hex_key()}
    ).json()
    assert created["capabilities"] == []


def test_set_capabilities_round_trip(client):
    created = client.post(
        "/principals", json={"org": "acme", "public_key": _hex_key()}
    ).json()
    res = client.put(
        f"/principals/{created['id']}/capabilities",
        json={"capabilities": ["offer", "counter"]},
    )
    assert res.status_code == 200
    assert res.json()["capabilities"] == ["offer", "counter"]

    refetched = client.get(f"/principals/{created['id']}").json()
    assert refetched["capabilities"] == ["offer", "counter"]


def test_set_capabilities_replaces_list(client):
    created = client.post(
        "/principals", json={"org": "acme", "public_key": _hex_key()}
    ).json()
    client.put(
        f"/principals/{created['id']}/capabilities",
        json={"capabilities": ["offer"]},
    )
    res = client.put(
        f"/principals/{created['id']}/capabilities",
        json={"capabilities": ["counter"]},
    )
    assert res.json()["capabilities"] == ["counter"]


def test_set_capabilities_dedupes_input(client):
    created = client.post(
        "/principals", json={"org": "acme", "public_key": _hex_key()}
    ).json()
    res = client.put(
        f"/principals/{created['id']}/capabilities",
        json={"capabilities": ["offer", "offer", "counter"]},
    )
    assert res.json()["capabilities"] == ["offer", "counter"]


def test_set_capabilities_rejects_unknown_type(client):
    created = client.post(
        "/principals", json={"org": "acme", "public_key": _hex_key()}
    ).json()
    res = client.put(
        f"/principals/{created['id']}/capabilities",
        json={"capabilities": ["offer", "not_a_real_commitment"]},
    )
    assert res.status_code == 422
    assert "not_a_real_commitment" in res.text


def test_set_capabilities_404_for_unknown_principal(client):
    res = client.put(
        "/principals/" + "0" * 32 + "/capabilities",
        json={"capabilities": []},
    )
    assert res.status_code == 404
