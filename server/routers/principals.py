"""principals routes: register, get, list, set capabilities.
registration is currently public and unauthenticated. validates that
public_key is a real 32-byte ed25519 key at the boundary so downstream
signature checks fail fast and clearly.

capabilities is the authority surface used by /commitments: the list of
commitment types this principal is permitted to emit. PUT replaces the
whole list (idempotent). validated against the known schema types so a
typo'd capability is caught at write time, not at gate time.
"""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from nacl.signing import VerifyKey
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from server import schema as schema_module
from server.deps import get_db, require_admin
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
    capabilities: list[str]
    created_at: datetime


class CapabilitiesUpdate(BaseModel):
    capabilities: list[str] = Field(default_factory=list)

    @field_validator("capabilities")
    @classmethod
    def _known_types(cls, v: list[str]) -> list[str]:
        known = set(schema_module.known_types())
        unknown = [c for c in v if c not in known]
        if unknown:
            raise ValueError(
                f"unknown commitment type(s): {sorted(unknown)}. "
                f"known types: {sorted(known)}"
            )
        # dedupe while preserving order
        seen: set[str] = set()
        deduped: list[str] = []
        for c in v:
            if c not in seen:
                seen.add(c)
                deduped.append(c)
        return deduped


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


@router.put(
    "/{principal_id}/capabilities",
    response_model=PrincipalRead,
    dependencies=[Depends(require_admin)],
)
def set_capabilities(
    principal_id: str,
    payload: CapabilitiesUpdate,
    db: Session = Depends(get_db),
) -> Principal:
    principal = db.get(Principal, principal_id)
    if principal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="principal not found"
        )
    principal.capabilities = payload.capabilities
    db.commit()
    db.refresh(principal)
    return principal
