"""sdk exception hierarchy + helper to translate non-2xx responses."""

from __future__ import annotations

import httpx


class MesaError(Exception):
    """base error for sdk failures (network errors, 5xx, anything unmapped)."""

    def __init__(self, message: str, *, status_code: int | None = None, body: str | None = None):
        super().__init__(message)
        self.status_code = status_code
        self.body = body


class BadRequest(MesaError):
    """4xx that doesn't have a more specific mapping."""


class Unauthorized(MesaError):
    """401."""


class NotFound(MesaError):
    """404."""


class Conflict(MesaError):
    """409."""


def _raise_for_status(response: httpx.Response) -> None:
    if response.is_success:
        return

    detail = _extract_detail(response)
    code = response.status_code
    if code == 401:
        raise Unauthorized(detail, status_code=code, body=response.text)
    if code == 404:
        raise NotFound(detail, status_code=code, body=response.text)
    if code == 409:
        raise Conflict(detail, status_code=code, body=response.text)
    if 400 <= code < 500:
        raise BadRequest(detail, status_code=code, body=response.text)
    raise MesaError(detail, status_code=code, body=response.text)


def _extract_detail(response: httpx.Response) -> str:
    try:
        body = response.json()
    except ValueError:
        return f"http {response.status_code}"
    if isinstance(body, dict) and "detail" in body:
        return str(body["detail"])
    return f"http {response.status_code}"
