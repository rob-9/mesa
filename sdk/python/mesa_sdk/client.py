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
from .models import Commitment, Deliberation, DeliberationDetail, Principal, Turn


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

    def set_capabilities(self, principal_id: str, capabilities: list[str]) -> Principal:
        r = self._http.put(
            f"/principals/{principal_id}/capabilities",
            json={"capabilities": capabilities},
        )
        _raise_for_status(r)
        return Principal.model_validate(r.json())


class _CommitmentsAPI:
    """authority-gated commitment writes.

    `create` takes the signed envelope dict produced by `Envelope.sign(keypair)`.
    on the wire, the server runs: signature -> authority -> schema -> policy.
    raises typed exceptions on failure (Unauthorized / BadRequest / etc).
    """

    def __init__(self, http: httpx.Client):
        self._http = http

    def create(self, signed_envelope: dict[str, Any]) -> Commitment:
        r = self._http.post("/commitments", json=signed_envelope)
        _raise_for_status(r)
        return Commitment.model_validate(r.json())


class _DeliberationsAPI:
    """layer-1 container management.

    `open` starts a new deliberation. `append_turn` posts a signed turn
    envelope into one. `get` returns the deliberation with embedded turns
    and commitments. `close` (and `reopen`) flip status.
    """

    def __init__(self, http: httpx.Client):
        self._http = http

    def open(
        self,
        *,
        title: str,
        counterparty_slug: str | None = None,
        stage: str = "offer",
    ) -> Deliberation:
        body: dict[str, Any] = {"title": title, "stage": stage}
        if counterparty_slug is not None:
            body["counterparty_slug"] = counterparty_slug
        r = self._http.post("/deliberations", json=body)
        _raise_for_status(r)
        return Deliberation.model_validate(r.json())

    def get(self, deliberation_id: str) -> DeliberationDetail:
        r = self._http.get(f"/deliberations/{deliberation_id}")
        _raise_for_status(r)
        return DeliberationDetail.model_validate(r.json())

    def list(self, *, status: str | None = None) -> list[Deliberation]:
        params = {"status": status} if status is not None else None
        r = self._http.get("/deliberations", params=params)
        _raise_for_status(r)
        return [Deliberation.model_validate(item) for item in r.json()]

    def close(self, deliberation_id: str) -> Deliberation:
        r = self._http.patch(
            f"/deliberations/{deliberation_id}", json={"status": "closed"}
        )
        _raise_for_status(r)
        return Deliberation.model_validate(r.json())

    def append_turn(
        self, deliberation_id: str, signed_envelope: dict[str, Any]
    ) -> Turn:
        r = self._http.post(
            f"/deliberations/{deliberation_id}/turns", json=signed_envelope
        )
        _raise_for_status(r)
        return Turn.model_validate(r.json())


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
        self.commitments = _CommitmentsAPI(self._http)
        self.deliberations = _DeliberationsAPI(self._http)

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
