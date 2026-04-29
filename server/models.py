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

from sqlalchemy import DateTime, String, func
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
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
