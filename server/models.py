"""sqlalchemy entities. all models live here to avoid circular imports.
split when it crosses ~800 lines.

planned tables:
  principal      orgs, users, agents
  deliberation   the atomic unit
  event          signed, hash-chained
  commitment     materialized from accepted proposals
  approval       human approvals
"""

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import JSON, DateTime, ForeignKey, String, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


def _uuid_hex() -> str:
    return uuid.uuid4().hex


class Principal(Base):
    __tablename__ = "principal"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid_hex)
    org: Mapped[str] = mapped_column(String(255), index=True)
    public_key: Mapped[str] = mapped_column(String(64), unique=True)
    # commitment types this principal is authorized to emit (e.g. ["offer", "counter"])
    capabilities: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class Commitment(Base):
    """a signed, schema-validated, policy-checked action by a principal.

    status reflects the policy gate verdict at write time:
      active   — passed all checks
      flagged  — passed authority + schema, but matched a `flag` policy
      blocked  — never persisted via /commitments; reserved for future
                 admin-side soft-blocks. v0.1 rejects blocked commitments
                 at the gate.
    """

    __tablename__ = "commitment"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid_hex)
    type: Mapped[str] = mapped_column(String(64), index=True)
    principal_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("principal.id"), index=True
    )
    payload: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    signature: Mapped[str] = mapped_column(String(128))
    status: Mapped[str] = mapped_column(String(16), default="active", index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
