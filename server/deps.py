"""shared fastapi dependencies."""

import os
import secrets

from fastapi import Header, HTTPException, status

from server.db import get_session

get_db = get_session


def require_admin(x_admin_token: str | None = Header(default=None)) -> None:
    """fail-closed admin gate: requires `X-Admin-Token` header to match the
    `MESA_ADMIN_TOKEN` env var. if the env var is unset, every request is
    refused — there is no "default open" deployment. tests override this
    dependency to bypass.
    """
    expected = os.environ.get("MESA_ADMIN_TOKEN")
    if not expected:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "admin_disabled", "message": "MESA_ADMIN_TOKEN is not configured"},
        )
    if not x_admin_token or not secrets.compare_digest(x_admin_token, expected):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "admin_forbidden", "message": "invalid or missing admin token"},
        )
