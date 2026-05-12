"""commitments router: POST /commitments runs the four gates in order.

  1. signature   — verify ed25519 against the emitting principal's stored pubkey
  2. authority   — type must be in principal.capabilities
  3. schema      — payload must validate against schemas/commitments/.../<type>.schema.json
  4. policy      — server.policy.evaluate(); block aborts the request, flag/route persist

ordering matters. authority runs before schema so a principal that can't emit
the type gets a 403 even if their payload would also have been invalid — saves
the schema lookup and avoids leaking schema details to unauthorized callers.

failure status codes:
  401 — bad/missing signature, unknown emitter
  403 — authority denial, or policy `block` action
  422 — schema validation failure (unknown type or payload mismatch)
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from server import policy as policy_module
from server import schema as schema_module
from server.deps import get_db
from server.events.envelope import EnvelopeError, canonical_bytes
from server.identity.keys import verify
from server.models import Commitment, Principal

router = APIRouter(prefix="/commitments", tags=["commitments"])


class CommitmentEnvelope(BaseModel):
    """signed commitment envelope as produced by `mesa_sdk.Envelope.sign()`.

    we accept the full envelope shape but only `type`, `emitted_by`, `payload`,
    and `signature` are load-bearing for v0.1. id/parent_id/timestamp are
    preserved on the wire (and signed over) so we can audit them later.
    """

    id: str = Field(min_length=1)
    parent_id: str | None = None
    timestamp: str = Field(min_length=1)
    type: str = Field(min_length=1)
    emitted_by: str = Field(min_length=1)
    payload: dict[str, Any]
    signature: str = Field(min_length=128, max_length=128)


class DecisionOut(BaseModel):
    action: str
    applied: list[dict[str, Any]]


class CommitmentOut(BaseModel):
    id: str
    type: str
    principal_id: str
    status: str
    decision: DecisionOut


@router.post("", response_model=CommitmentOut, status_code=status.HTTP_201_CREATED)
def create_commitment(
    envelope: CommitmentEnvelope, db: Session = Depends(get_db)
) -> CommitmentOut:
    # 1. signature
    principal = db.get(Principal, envelope.emitted_by)
    if principal is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="unknown principal in emitted_by",
        )

    try:
        env_bytes = canonical_bytes(envelope.model_dump())
    except EnvelopeError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))

    try:
        sig_bytes = bytes.fromhex(envelope.signature)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="signature is not hex"
        )

    pubkey_bytes = bytes.fromhex(principal.public_key)
    if not verify(env_bytes, sig_bytes, pubkey_bytes):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid signature"
        )

    # 2. authority
    caps = principal.capabilities or []
    if envelope.type not in caps:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "policy": "authority",
                "action": "block",
                "reason": (
                    f"principal {principal.id} is not authorized to emit "
                    f"commitments of type '{envelope.type}'"
                ),
            },
        )

    # 3. schema
    try:
        schema_module.validate(envelope.type, envelope.payload)
    except schema_module.SchemaValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)
        )

    # 4. policy
    commitment = Commitment(
        type=envelope.type,
        principal_id=principal.id,
        payload=envelope.payload,
        signature=envelope.signature,
        status="active",
    )
    decision = policy_module.evaluate(db, principal, commitment)

    if decision.action == "block":
        # do not persist the commitment, but DO commit the hits30d increments
        # from policy.evaluate so the dashboard reflects the block. without
        # this commit, the raise rolls back the implicit transaction and the
        # hit counter silently drops every blocked request.
        db.commit()
        first_block = next(a for a in decision.applied if a["action"] == "block")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "policy": first_block["policy_name"],
                "policy_id": first_block["policy_id"],
                "action": "block",
                "reason": "blocked by policy",
            },
        )

    if decision.action in ("flag", "route"):
        commitment.status = "flagged"
    # action == "allow" leaves status at "active"

    db.add(commitment)
    db.commit()
    db.refresh(commitment)

    return CommitmentOut(
        id=commitment.id,
        type=commitment.type,
        principal_id=commitment.principal_id,
        status=commitment.status,
        decision=DecisionOut(action=decision.action, applied=decision.applied),
    )
