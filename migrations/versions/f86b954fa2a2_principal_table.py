"""principal table

Revision ID: f86b954fa2a2
Revises:
Create Date: 2026-04-29 10:25:24.549269

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "f86b954fa2a2"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "principal",
        sa.Column("id", sa.String(length=32), primary_key=True),
        sa.Column("org", sa.String(length=255), nullable=False),
        sa.Column("public_key", sa.String(length=64), nullable=False, unique=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )
    op.create_index("ix_principal_org", "principal", ["org"])


def downgrade() -> None:
    op.drop_index("ix_principal_org", table_name="principal")
    op.drop_table("principal")
