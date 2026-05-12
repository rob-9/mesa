"""commitment table + principal.capabilities

Revision ID: a3c2b1d4e5f6
Revises: f86b954fa2a2
Create Date: 2026-05-12 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "a3c2b1d4e5f6"
down_revision: Union[str, Sequence[str], None] = "f86b954fa2a2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "principal",
        sa.Column(
            "capabilities",
            sa.JSON(),
            nullable=False,
            server_default=sa.text("'[]'"),
        ),
    )

    op.create_table(
        "commitment",
        sa.Column("id", sa.String(length=32), primary_key=True),
        sa.Column("type", sa.String(length=64), nullable=False),
        sa.Column(
            "principal_id",
            sa.String(length=32),
            sa.ForeignKey("principal.id"),
            nullable=False,
        ),
        sa.Column("payload", sa.JSON(), nullable=False),
        sa.Column("signature", sa.String(length=128), nullable=False),
        sa.Column(
            "status",
            sa.String(length=16),
            nullable=False,
            server_default="active",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )
    op.create_index("ix_commitment_type", "commitment", ["type"])
    op.create_index("ix_commitment_principal_id", "commitment", ["principal_id"])
    op.create_index("ix_commitment_status", "commitment", ["status"])


def downgrade() -> None:
    op.drop_index("ix_commitment_status", table_name="commitment")
    op.drop_index("ix_commitment_principal_id", table_name="commitment")
    op.drop_index("ix_commitment_type", table_name="commitment")
    op.drop_table("commitment")
    op.drop_column("principal", "capabilities")
