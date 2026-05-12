"""sdk exception hierarchy + helper to translate non-2xx responses.

server error bodies use a structured `detail` object:
    {"code": "...", "message": "...", ...extra fields...}

`_extract_detail` flattens this for the exception message (`code: message`)
while preserving the raw object on `error.detail` for callers that need to
discriminate programmatically.
"""

from __future__ import annotations

from typing import Any

import httpx


class MesaError(Exception):
    """base error for sdk failures (network errors, 5xx, anything unmapped)."""

    def __init__(
        self,
        message: str,
        *,
        status_code: int | None = None,
        body: str | None = None,
        detail: Any | None = None,
        code: str | None = None,
    ):
        super().__init__(message)
        self.status_code = status_code
        self.body = body
        self.detail = detail
        self.code = code


class BadRequest(MesaError):
    """4xx with no more specific mapping (e.g. 422)."""


class Unauthorized(MesaError):
    """401 — signature failure, unknown principal."""


class Forbidden(MesaError):
    """403 — authority denial, policy block, admin-token rejection."""


class NotFound(MesaError):
    """404."""


class Conflict(MesaError):
    """409."""


def _raise_for_status(response: httpx.Response) -> None:
    if response.is_success:
        return

    message, raw_detail, code_str = _extract_detail(response)
    code = response.status_code
    kw = dict(status_code=code, body=response.text, detail=raw_detail, code=code_str)

    if code == 401:
        raise Unauthorized(message, **kw)
    if code == 403:
        raise Forbidden(message, **kw)
    if code == 404:
        raise NotFound(message, **kw)
    if code == 409:
        raise Conflict(message, **kw)
    if 400 <= code < 500:
        raise BadRequest(message, **kw)
    raise MesaError(message, **kw)


def _extract_detail(response: httpx.Response) -> tuple[str, Any | None, str | None]:
    """returns (message, raw_detail, code) for the exception.

    handles both structured (`{detail: {code, message, ...}}`) and legacy
    string-detail bodies; falls back to "http {status}" on non-json.
    """
    try:
        body = response.json()
    except ValueError:
        return f"http {response.status_code}", None, None
    if not isinstance(body, dict) or "detail" not in body:
        return f"http {response.status_code}", None, None

    detail = body["detail"]
    if isinstance(detail, dict):
        code = detail.get("code")
        msg = detail.get("message") or f"http {response.status_code}"
        return f"{code}: {msg}" if code else msg, detail, code
    return str(detail), detail, None
