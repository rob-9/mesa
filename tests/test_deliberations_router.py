"""http tests for /deliberations CRUD."""

from __future__ import annotations


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
