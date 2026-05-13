"""event envelope: id, parent_id, timestamp, type, emitted_by, payload, signature.

## canonical byte form

the bytes that get signed are produced by `Envelope.canonical_bytes()` and
must be reproducible **byte-for-byte** by any party verifying the signature
(the python server today, future TS/Go SDKs tomorrow). the contract:

  - utf-8 encoded
  - json with `sort_keys=True` — recursively sorts nested dicts too
  - no whitespace: `separators=(",", ":")`
  - `ensure_ascii=False` — non-ASCII chars emit as raw utf-8 bytes, NOT
    `\\uXXXX` escapes
  - `allow_nan=False` — NaN/Infinity refused outright (non-standard json
    that cross-language canonicalizers reject)
  - the `signature` field is excluded from the canonicalized dict

## constraints on payloads

  - **no non-finite floats** (NaN, +Inf, -Inf) — they will raise
  - **no python-native objects** (datetime, UUID, Decimal, Pydantic models):
    pass primitives only (str, int, float, bool, None, list, dict)
  - **timestamp is an opaque string** — server-side verifiers must NOT
    parse + re-emit (`isoformat()` would change `Z` to `+00:00`, breaking
    verification). store and forward as-is.
  - **no unicode normalization** (NFC/NFD) — `"caf\\u00e9"` (1 codepoint)
    and `"cafe\\u0301"` (2 codepoints) sign to different bytes. callers
    should normalize upstream if they want them treated as equivalent.
"""

from __future__ import annotations

import json
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

from .keys import Keypair


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
        # allow_nan=False refuses NaN/Infinity — non-standard JSON that
        # cross-language canonicalizers will reject, producing un-verifiable bytes.
        return json.dumps(
            self.to_dict(),
            sort_keys=True,
            separators=(",", ":"),
            ensure_ascii=False,
            allow_nan=False,
        ).encode("utf-8")

    def sign(self, keypair: Keypair) -> dict[str, Any]:
        signature = keypair.sign(self.canonical_bytes())
        return {**self.to_dict(), "signature": signature.hex()}
