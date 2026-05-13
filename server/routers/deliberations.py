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
from sqlalchemy import select
from sqlalchemy.orm import Session

from server.deps import get_db
from server.models import Commitment, Deliberation, Turn

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
