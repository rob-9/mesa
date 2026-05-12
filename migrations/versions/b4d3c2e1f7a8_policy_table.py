"""policy table

Revision ID: b4d3c2e1f7a8
Revises: a3c2b1d4e5f6
Create Date: 2026-05-12 00:00:01.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "b4d3c2e1f7a8"
down_revision: Union[str, Sequence[str], None] = "a3c2b1d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "policy",
        sa.Column("id", sa.String(length=32), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("scope_kind", sa.String(length=16), nullable=False),
        sa.Column("scope_ref", sa.String(length=255), nullable=True),
        sa.Column("predicate_name", sa.String(length=64), nullable=False),
        sa.Column("params", sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
        sa.Column("action", sa.String(length=16), nullable=False),
        sa.Column("route_to", sa.String(length=255), nullable=True),
        sa.Column(
            "enabled",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true(),
        ),
        sa.Column(
            "hits30d",
            sa.Integer(),
            nullable=False,
            server_default=sa.text("0"),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )
    op.create_index(
        "ix_policy_enabled_scope",
        "policy",
        ["enabled", "scope_kind", "scope_ref"],
    )


def downgrade() -> None:
    op.drop_index("ix_policy_enabled_scope", table_name="policy")
    op.drop_table("policy")
