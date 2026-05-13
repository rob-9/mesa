"""deliberations routes: open (POST), get with embedded turns + commitments,
list with optional status filter, patch (close/reopen).

deliberations are the layer-1 container; commitments and turns live inside.
v0.1 keeps the surface small: no stage-machine enforcement, no participants
table — `counterparty_slug` is just a free-form label until the counterparty
work lands.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from server.deps import get_db
from server.events.envelope import EnvelopeError, canonical_bytes
from server.identity.keys import verify
from server.models import Commitment, Deliberation, Principal, Turn
from server.schema import SchemaValidationError, validate as validate_schema

router = APIRouter(prefix="/deliberations", tags=["deliberations"])


_VALID_STATUSES = ("open", "closed")
_VALID_STAGES = ("offer", "scope", "amendment", "signoff")


class DeliberationCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    counterparty_slug: str | None = Field(default=None, max_length=255)
    stage: str = Field(default="offer")

    @field_validator("title")
    @classmethod
    def _strip_title(cls, v: str) -> str:
        s = v.strip()
        if not s:
            raise ValueError("title must not be blank")
        return s

    @field_validator("stage")
    @classmethod
    def _known_stage(cls, v: str) -> str:
        if v not in _VALID_STAGES:
            raise ValueError(f"stage must be one of {_VALID_STAGES}")
        return v


class DeliberationPatch(BaseModel):
    status: Literal["open", "closed"] | None = None
    stage: str | None = None

    @field_validator("stage")
    @classmethod
    def _known_stage(cls, v: str | None) -> str | None:
        if v is not None and v not in _VALID_STAGES:
            raise ValueError(f"stage must be one of {_VALID_STAGES}")
        return v


class DeliberationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    counterparty_slug: str | None
    stage: str
    status: str
    created_at: datetime


class TurnRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    deliberation_id: str
    speaker_id: str
    content: str
    index: int
    created_at: datetime


class CommitmentRef(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    type: str
    principal_id: str
    status: str
    payload: dict[str, Any]
    created_at: datetime


class DeliberationDetail(DeliberationRead):
    turns: list[TurnRead]
    commitments: list[CommitmentRef]


@router.post("", response_model=DeliberationRead, status_code=status.HTTP_201_CREATED)
def create_deliberation(
    payload: DeliberationCreate, db: Session = Depends(get_db)
) -> Deliberation:
    d = Deliberation(
        title=payload.title,
        counterparty_slug=payload.counterparty_slug,
        stage=payload.stage,
    )
    db.add(d)
    db.commit()
    db.refresh(d)
    return d


@router.get("", response_model=list[DeliberationRead])
def list_deliberations(
    status: str | None = None, db: Session = Depends(get_db)
) -> list[Deliberation]:
    q = select(Deliberation).order_by(Deliberation.created_at)
    if status is not None:
        if status not in _VALID_STATUSES:
            raise HTTPException(
                status_code=422,
                detail={"code": "invalid_status", "message": f"status must be one of {_VALID_STATUSES}"},
            )
        q = q.where(Deliberation.status == status)
    return list(db.scalars(q).all())


@router.get("/{deliberation_id}", response_model=DeliberationDetail)
def get_deliberation(
    deliberation_id: str, db: Session = Depends(get_db)
) -> DeliberationDetail:
    d = db.get(Deliberation, deliberation_id)
    if d is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "not_found", "message": "deliberation not found"},
        )
    turns = list(
        db.scalars(
            select(Turn)
            .where(Turn.deliberation_id == d.id)
            .order_by(Turn.index)
        ).all()
    )
    commitments = list(
        db.scalars(
            select(Commitment)
            .where(Commitment.deliberation_id == d.id)
            .order_by(Commitment.created_at)
        ).all()
    )
    return DeliberationDetail(
        id=d.id,
        title=d.title,
        counterparty_slug=d.counterparty_slug,
        stage=d.stage,
        status=d.status,
        created_at=d.created_at,
        turns=[TurnRead.model_validate(t) for t in turns],
        commitments=[CommitmentRef.model_validate(c) for c in commitments],
    )


class TurnEnvelope(BaseModel):
    """signed turn envelope; mirrors `mesa_sdk.Envelope.sign()` output.
    `type` must equal "turn"; payload is the turn schema (just `content`).
    """

    id: str = Field(min_length=1)
    parent_id: str | None = None
    timestamp: str = Field(min_length=1)
    type: str = Field(min_length=1)
    emitted_by: str = Field(min_length=1)
    payload: dict[str, Any]
    signature: str = Field(min_length=128, max_length=128)

    @field_validator("signature")
    @classmethod
    def _hex(cls, v: str) -> str:
        try:
            bytes.fromhex(v)
        except ValueError as e:
            raise ValueError("signature must be hex-encoded") from e
        return v.lower()


@router.post(
    "/{deliberation_id}/turns",
    response_model=TurnRead,
    status_code=status.HTTP_201_CREATED,
)
def append_turn(
    deliberation_id: str,
    envelope: TurnEnvelope,
    db: Session = Depends(get_db),
) -> Turn:
    # signature gate — same shape as /commitments
    principal = db.get(Principal, envelope.emitted_by)
    if principal is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "unknown_principal", "message": "unknown principal in emitted_by"},
        )

    try:
        env_bytes = canonical_bytes(envelope.model_dump())
    except EnvelopeError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"code": "malformed_envelope", "message": str(e)},
        )

    try:
        pubkey_bytes = bytes.fromhex(principal.public_key)
        sig_bytes = bytes.fromhex(envelope.signature)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "invalid_signature", "message": "signature or pubkey is not hex"},
        )

    if not verify(env_bytes, sig_bytes, pubkey_bytes):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "invalid_signature", "message": "signature does not verify"},
        )

    # turns are layer 1 — no capability gate. anyone with a valid signature
    # can talk. authority only constrains layer-2 commitments.
    if envelope.type != "turn":
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"code": "wrong_envelope_type", "message": "envelope type must be 'turn'"},
        )
    try:
        validate_schema("turn", envelope.payload)
    except SchemaValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"code": "schema_invalid", "message": str(e)},
        )

    d = db.get(Deliberation, deliberation_id)
    if d is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "not_found", "message": "deliberation not found"},
        )
    if d.status != "open":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "deliberation_closed", "message": f"deliberation status is {d.status!r}"},
        )

    # monotonic per-deliberation index; computed under the open transaction.
    # the (deliberation_id, index) UNIQUE constraint backs this up — if two
    # turns race, one inserts and the other fails on flush, surfacing as 500
    # for v0.1 (acceptable; retries from agents are fine).
    next_index = db.scalar(
        select(func.coalesce(func.max(Turn.index), -1) + 1).where(
            Turn.deliberation_id == d.id
        )
    )

    turn = Turn(
        deliberation_id=d.id,
        speaker_id=principal.id,
        content=envelope.payload["content"],
        index=int(next_index or 0),
        signature=envelope.signature,
    )
    db.add(turn)
    db.commit()
    db.refresh(turn)
    return turn


@router.patch("/{deliberation_id}", response_model=DeliberationRead)
def patch_deliberation(
    deliberation_id: str,
    payload: DeliberationPatch,
    db: Session = Depends(get_db),
) -> Deliberation:
    d = db.get(Deliberation, deliberation_id)
    if d is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "not_found", "message": "deliberation not found"},
        )
    if payload.status is not None:
        d.status = payload.status
    if payload.stage is not None:
        d.stage = payload.stage
    db.commit()
    db.refresh(d)
    return d
