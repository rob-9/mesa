"""tests for the admin gate (server.deps.require_admin).

uses an UNOVERRIDDEN TestClient so the real dependency runs. each test sets
MESA_ADMIN_TOKEN as needed via monkeypatch.
"""

from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from server.deps import get_db
from server.main import app


@pytest.fixture
def admin_client(db_session) -> Iterator[TestClient]:
    """TestClient that overrides only get_db — the admin gate runs for real."""
    def _override() -> Iterator[Session]:
        yield db_session

    app.dependency_overrides[get_db] = _override
    try:
        with TestClient(app) as c:
            yield c
    finally:
        app.dependency_overrides.pop(get_db, None)


def _make_principal(client: TestClient) -> str:
    from server.identity.keys import generate_keypair

    _, pub = generate_keypair()
    res = client.post("/principals", json={"org": "acme", "public_key": pub.hex()})
    assert res.status_code == 201
    return res.json()["id"]


def test_capabilities_rejected_without_token_set(admin_client, monkeypatch):
    monkeypatch.delenv("MESA_ADMIN_TOKEN", raising=False)
    pid = _make_principal(admin_client)
    res = admin_client.put(
        f"/principals/{pid}/capabilities", json={"capabilities": []}
    )
    assert res.status_code == 403
    assert res.json()["detail"]["code"] == "admin_disabled"


def test_capabilities_rejected_with_missing_header(admin_client, monkeypatch):
    monkeypatch.setenv("MESA_ADMIN_TOKEN", "s3cret")
    pid = _make_principal(admin_client)
    res = admin_client.put(
        f"/principals/{pid}/capabilities", json={"capabilities": []}
    )
    assert res.status_code == 403
    assert res.json()["detail"]["code"] == "admin_forbidden"


def test_capabilities_rejected_with_wrong_token(admin_client, monkeypatch):
    monkeypatch.setenv("MESA_ADMIN_TOKEN", "s3cret")
    pid = _make_principal(admin_client)
    res = admin_client.put(
        f"/principals/{pid}/capabilities",
        json={"capabilities": []},
        headers={"X-Admin-Token": "wrong"},
    )
    assert res.status_code == 403
    assert res.json()["detail"]["code"] == "admin_forbidden"


def test_capabilities_allowed_with_correct_token(admin_client, monkeypatch):
    monkeypatch.setenv("MESA_ADMIN_TOKEN", "s3cret")
    pid = _make_principal(admin_client)
    res = admin_client.put(
        f"/principals/{pid}/capabilities",
        json={"capabilities": ["offer"]},
        headers={"X-Admin-Token": "s3cret"},
    )
    assert res.status_code == 200
    assert res.json()["capabilities"] == ["offer"]
