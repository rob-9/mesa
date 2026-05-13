"""sqlalchemy entities. all models live here to avoid circular imports.
split when it crosses ~800 lines.

current tables:
  principal     orgs, users, agents — public_key + capabilities
  deliberation  atomic negotiation unit; owns turns + commitments
  turn          freeform layer-1 transcript entries
  commitment    signed, schema-validated, policy-gated layer-2 actions
  policy        named-predicate rules: scope, action, route_to, hits30d

planned (not yet defined):
  event         append-only signed audit log (hash-chained in a later pass)
  approval      human-in-the-loop queue for action="route"

note on JSON columns: we use `sa.JSON` for portability (sqlite in tests,
postgres in prod). this stores values as TEXT in sqlite and JSON in postgres,
but we give up postgres jsonb operators (`->`, `->>`, GIN indexes). switch
the relevant columns to `postgresql.JSONB` if/when we need to query into
`commitment.payload` or `policy.params` server-side.
"""

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, String, event, func
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


class Deliberation(Base):
    """the atomic negotiation. owns a layer-1 transcript (Turn) and a
    layer-2 commitment graph. status gates writes: only `open` deliberations
    accept new turns and commitments.

    stage is a free-form label the orchestrator uses for UX ('offer' /
    'scope' / 'amendment' / 'signoff'). v0.1 does not enforce stage
    transitions; that's a state-machine pass coming in `server/deliberations/state.py`.
    """

    __tablename__ = "deliberation"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid_hex)
    title: Mapped[str] = mapped_column(String(255))
    counterparty_slug: Mapped[str | None] = mapped_column(String(255), nullable=True)
    stage: Mapped[str] = mapped_column(String(32), default="offer")
    status: Mapped[str] = mapped_column(String(16), default="open", index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class Turn(Base):
    """freeform transcript entry within a deliberation. signed envelopes
    of type='turn' land here. order within a deliberation is captured by
    `index` (monotonic, per-deliberation), assigned at write time.
    """

    __tablename__ = "turn"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid_hex)
    deliberation_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("deliberation.id"), index=True
    )
    speaker_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("principal.id"), index=True
    )
    content: Mapped[str] = mapped_column(String(8192))
    index: Mapped[int] = mapped_column(Integer)
    signature: Mapped[str] = mapped_column(String(128))
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

    deliberation_id is nullable for historical commitments that predate the
    layer-1 container. new commitments via /commitments will require it
    going forward (enforced in the router, not at the column level, until
    a follow-up backfill + NOT NULL migration).
    """

    __tablename__ = "commitment"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid_hex)
    type: Mapped[str] = mapped_column(String(64), index=True)
    principal_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("principal.id"), index=True
    )
    deliberation_id: Mapped[str | None] = mapped_column(
        String(32), ForeignKey("deliberation.id"), index=True, nullable=True
    )
    payload: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    signature: Mapped[str] = mapped_column(String(128))
    status: Mapped[str] = mapped_column(String(16), default="active", index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class Policy(Base):
    """a named-predicate rule that gates incoming commitments.

    scope_kind / scope_ref restrict when the policy applies:
      global       — every commitment
      agent        — scope_ref == principal.id
      counterparty — scope_ref == counterparty slug (deferred wiring; v0.1
                     server has no counterparty concept yet, so this is
                     stored but ignored by the matcher)

    predicate_name keys into server.policy._PREDICATES; params is whatever
    the predicate needs (e.g. {"cap": 36}).
    """

    __tablename__ = "policy"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid_hex)
    name: Mapped[str] = mapped_column(String(255))
    scope_kind: Mapped[str] = mapped_column(String(16))
    scope_ref: Mapped[str | None] = mapped_column(String(255), nullable=True)
    predicate_name: Mapped[str] = mapped_column(String(64))
    params: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    action: Mapped[str] = mapped_column(String(16))  # allow | flag | block | route
    route_to: Mapped[str | None] = mapped_column(String(255), nullable=True)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    hits30d: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


@event.listens_for(Policy, "before_insert")
@event.listens_for(Policy, "before_update")
def _validate_route_to(mapper, connection, policy: Policy) -> None:
    if policy.action == "route" and not policy.route_to:
        raise ValueError("Policy action='route' requires a non-empty route_to")
