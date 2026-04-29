"""principals routes: register, get, list."""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from nacl.signing import VerifyKey
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from server.deps import get_db
from server.models import Principal

router = APIRouter(prefix="/principals", tags=["principals"])


class PrincipalCreate(BaseModel):
    org: str = Field(min_length=1, max_length=255)
    public_key: str = Field(min_length=64, max_length=64)

    @field_validator("org")
    @classmethod
    def _strip_org(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("org must not be blank")
        return stripped

    @field_validator("public_key")
    @classmethod
    def _ed25519_pubkey(cls, v: str) -> str:
        try:
            VerifyKey(bytes.fromhex(v))
        except ValueError as e:
            raise ValueError("public_key must be a valid ed25519 public key (32-byte hex)") from e
        return v.lower()


class PrincipalRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    org: str
    public_key: str
    created_at: datetime


@router.post("", response_model=PrincipalRead, status_code=status.HTTP_201_CREATED)
def create_principal(payload: PrincipalCreate, db: Session = Depends(get_db)) -> Principal:
    principal = Principal(org=payload.org, public_key=payload.public_key)
    db.add(principal)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="public_key already registered",
        )
    db.refresh(principal)
    return principal


@router.get("/{principal_id}", response_model=PrincipalRead)
def get_principal(principal_id: str, db: Session = Depends(get_db)) -> Principal:
    principal = db.get(Principal, principal_id)
    if principal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="principal not found")
    return principal


@router.get("", response_model=list[PrincipalRead])
def list_principals(db: Session = Depends(get_db)) -> list[Principal]:
    return list(db.query(Principal).order_by(Principal.created_at).all())
