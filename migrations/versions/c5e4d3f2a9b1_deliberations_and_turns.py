"""deliberations and turns; commitment.deliberation_id

Revision ID: c5e4d3f2a9b1
Revises: b4d3c2e1f7a8
Create Date: 2026-05-13 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "c5e4d3f2a9b1"
down_revision: Union[str, Sequence[str], None] = "b4d3c2e1f7a8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "deliberation",
        sa.Column("id", sa.String(length=32), primary_key=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("counterparty_slug", sa.String(length=255), nullable=True),
        sa.Column("stage", sa.String(length=32), nullable=False, server_default="offer"),
        sa.Column(
            "status",
            sa.String(length=16),
            nullable=False,
            server_default="open",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )
    op.create_index("ix_deliberation_status", "deliberation", ["status"])

    op.create_table(
        "turn",
        sa.Column("id", sa.String(length=32), primary_key=True),
        sa.Column(
            "deliberation_id",
            sa.String(length=32),
            sa.ForeignKey("deliberation.id"),
            nullable=False,
        ),
        sa.Column(
            "speaker_id",
            sa.String(length=32),
            sa.ForeignKey("principal.id"),
            nullable=False,
        ),
        sa.Column("content", sa.String(length=8192), nullable=False),
        sa.Column("index", sa.Integer(), nullable=False),
        sa.Column("signature", sa.String(length=128), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )
    op.create_index("ix_turn_deliberation_id", "turn", ["deliberation_id"])
    op.create_index("ix_turn_speaker_id", "turn", ["speaker_id"])
    # one row per (deliberation, index); enforces monotonic ordering
    op.create_unique_constraint(
        "uq_turn_deliberation_index", "turn", ["deliberation_id", "index"]
    )

    # nullable FK from commitment to deliberation; existing rows have no parent.
    # the router will enforce non-null for new writes. NOT NULL is a follow-up
    # after any historical commitments are backfilled (or accepted as orphans).
    op.add_column(
        "commitment",
        sa.Column(
            "deliberation_id",
            sa.String(length=32),
            sa.ForeignKey("deliberation.id"),
            nullable=True,
        ),
    )
    op.create_index(
        "ix_commitment_deliberation_id", "commitment", ["deliberation_id"]
    )


def downgrade() -> None:
    op.drop_index("ix_commitment_deliberation_id", table_name="commitment")
    op.drop_column("commitment", "deliberation_id")
    op.drop_constraint("uq_turn_deliberation_index", "turn", type_="unique")
    op.drop_index("ix_turn_speaker_id", table_name="turn")
    op.drop_index("ix_turn_deliberation_id", table_name="turn")
    op.drop_table("turn")
    op.drop_index("ix_deliberation_status", table_name="deliberation")
    op.drop_table("deliberation")
