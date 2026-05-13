"""canonical json envelope: id, parent_id, timestamp, type, emitted_by,
deliberation_id, payload, signature.

deterministic byte form for signing and hashing. MUST stay byte-for-byte
identical to `sdk/python/mesa_sdk/envelope.py::Envelope.canonical_bytes()`,
since signatures cross the wire produced by one side and verified by the other.

contract:
- input is the envelope dict with the `signature` field removed
- utf-8 json, sorted keys at every level, no whitespace, separators=(",", ":")
- ensure_ascii=False (non-ASCII emitted as raw utf-8 bytes)
- allow_nan=False (NaN/Infinity refused; cross-language canonicalizers reject them)

deliberation_id is nullable in the canonical bytes — turns scope it via the
URL path and may omit/repeat it; commitments must include a non-null value
or the router rejects them at the gate.
"""

from __future__ import annotations

import json
from typing import Any

ENVELOPE_FIELDS = (
    "id",
    "parent_id",
    "timestamp",
    "type",
    "emitted_by",
    "deliberation_id",
    "payload",
)


class EnvelopeError(ValueError):
    """malformed envelope (missing required fields, NaN in payload, etc)."""


def canonical_bytes(envelope: dict[str, Any]) -> bytes:
    """canonicalize an envelope for signing/verifying.

    only the standard envelope fields are included; `signature` and any other
    keys are ignored. raises EnvelopeError if a required field is missing.
    """
    body = {}
    for field in ENVELOPE_FIELDS:
        if field not in envelope:
            raise EnvelopeError(f"envelope missing required field '{field}'")
        body[field] = envelope[field]
    try:
        return json.dumps(
            body,
            sort_keys=True,
            separators=(",", ":"),
            ensure_ascii=False,
            allow_nan=False,
        ).encode("utf-8")
    except ValueError as e:
        raise EnvelopeError(str(e)) from e
