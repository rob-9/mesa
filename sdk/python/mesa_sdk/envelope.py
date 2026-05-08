"""event envelope: id, parent_id, timestamp, type, emitted_by, payload, signature.

canonical byte form is utf-8 json with sorted keys and no whitespace, computed
over the envelope dict with the `signature` field omitted. signing produces a
plain dict ready to serialize as the http body.
"""

from __future__ import annotations

import json
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

from mesa_sdk.keys import Keypair


def _now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%fZ")


def _new_id() -> str:
    return f"evt_{uuid.uuid4().hex}"


@dataclass
class Envelope:
    type: str
    emitted_by: str
    payload: dict[str, Any]
    parent_id: str | None = None
    id: str = field(default_factory=_new_id)
    timestamp: str = field(default_factory=_now_iso)

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "parent_id": self.parent_id,
            "timestamp": self.timestamp,
            "type": self.type,
            "emitted_by": self.emitted_by,
            "payload": self.payload,
        }

    def canonical_bytes(self) -> bytes:
        return json.dumps(
            self.to_dict(),
            sort_keys=True,
            separators=(",", ":"),
            ensure_ascii=False,
        ).encode("utf-8")

    def sign(self, keypair: Keypair) -> dict[str, Any]:
        signature = keypair.sign(self.canonical_bytes())
        return {**self.to_dict(), "signature": signature.hex()}
