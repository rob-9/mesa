"""direct unit tests for the http-status -> exception mapping.

the integration tests in test_client.py cover the 404/409 paths against real
server endpoints; this file covers the 400/401/5xx branches that have no
producing route in v0.1.
"""

import httpx
import pytest

from mesa_sdk.errors import (
    BadRequest,
    Conflict,
    MesaError,
    NotFound,
    Unauthorized,
    _raise_for_status,
)


def _response(status: int, *, json: dict | None = None, text: str | None = None) -> httpx.Response:
    if json is not None:
        return httpx.Response(status, json=json)
    return httpx.Response(status, text=text or "")


def test_2xx_does_not_raise():
    _raise_for_status(_response(200, json={"ok": True}))
    _raise_for_status(_response(204))


def test_400_raises_bad_request():
    with pytest.raises(BadRequest) as exc:
        _raise_for_status(_response(400, json={"detail": "bad input"}))
    assert exc.value.status_code == 400
    assert "bad input" in str(exc.value)


def test_401_raises_unauthorized():
    with pytest.raises(Unauthorized) as exc:
        _raise_for_status(_response(401, json={"detail": "no token"}))
    assert exc.value.status_code == 401


def test_403_falls_through_to_bad_request():
    # 403 is not specifically mapped; it's a 4xx so it should land on BadRequest.
    with pytest.raises(BadRequest) as exc:
        _raise_for_status(_response(403, json={"detail": "forbidden"}))
    assert exc.value.status_code == 403


def test_404_raises_not_found():
    with pytest.raises(NotFound) as exc:
        _raise_for_status(_response(404, json={"detail": "missing"}))
    assert exc.value.status_code == 404


def test_409_raises_conflict():
    with pytest.raises(Conflict) as exc:
        _raise_for_status(_response(409, json={"detail": "duplicate"}))
    assert exc.value.status_code == 409


def test_422_raises_bad_request():
    with pytest.raises(BadRequest) as exc:
        _raise_for_status(_response(422, json={"detail": "validation failed"}))
    assert exc.value.status_code == 422


def test_500_raises_mesa_error_not_subclass():
    with pytest.raises(MesaError) as exc:
        _raise_for_status(_response(500, json={"detail": "boom"}))
    assert exc.value.status_code == 500
    # 5xx must NOT be classified as a 4xx subclass.
    assert not isinstance(exc.value, BadRequest)


def test_503_raises_mesa_error():
    with pytest.raises(MesaError) as exc:
        _raise_for_status(_response(503))
    assert exc.value.status_code == 503


def test_non_json_body_uses_status_fallback():
    with pytest.raises(BadRequest) as exc:
        _raise_for_status(_response(400, text="<html>not json</html>"))
    assert "400" in str(exc.value)
    assert exc.value.body == "<html>not json</html>"


def test_missing_detail_key_uses_status_fallback():
    with pytest.raises(NotFound) as exc:
        _raise_for_status(_response(404, json={"error": "no detail key"}))
    assert "404" in str(exc.value)
