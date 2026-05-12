"""sync httpx client for the mesa server.

usage:
    with MesaClient("http://localhost:8000") as client:
        client.health()
        p = client.principals.create(org="acme", public_key=kp.public_key_hex)

namespaces (`client.principals`) keep the surface organized as more routes land.
"""

from __future__ import annotations

from typing import Any

import httpx

from .errors import _raise_for_status
from .models import Principal


class _PrincipalsAPI:
    def __init__(self, http: httpx.Client):
        self._http = http

    def create(self, *, org: str, public_key: str) -> Principal:
        r = self._http.post("/principals", json={"org": org, "public_key": public_key})
        _raise_for_status(r)
        return Principal.model_validate(r.json())

    def get(self, principal_id: str) -> Principal:
        r = self._http.get(f"/principals/{principal_id}")
        _raise_for_status(r)
        return Principal.model_validate(r.json())

    def list(self) -> list[Principal]:
        r = self._http.get("/principals")
        _raise_for_status(r)
        return [Principal.model_validate(item) for item in r.json()]


class MesaClient:
    def __init__(
        self,
        base_url: str | None = None,
        *,
        timeout: float = 10.0,
        http: httpx.Client | None = None,
    ):
        if http is None:
            if base_url is None:
                raise ValueError("base_url is required when http is not provided")
            http = httpx.Client(base_url=base_url, timeout=timeout)
        self._http = http
        self.principals = _PrincipalsAPI(self._http)

    def health(self) -> dict[str, Any]:
        r = self._http.get("/health")
        _raise_for_status(r)
        return r.json()

    def close(self) -> None:
        self._http.close()

    def __enter__(self) -> "MesaClient":
        return self

    def __exit__(self, exc_type, exc, tb) -> None:
        self.close()
