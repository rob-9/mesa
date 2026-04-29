"""sqlalchemy entities. all models live here to avoid circular imports.
split when it crosses ~800 lines.

planned tables:
  principal      orgs, users, agents
  deliberation   the atomic unit
  event          signed, hash-chained
  commitment     materialized from accepted proposals
  approval       human approvals
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
