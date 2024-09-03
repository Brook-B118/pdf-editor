"""Add z-index column to elements

Revision ID: 32d7a0b622e6
Revises: fc7edcc0dd19
Create Date: 2024-09-03 13:06:41.084597

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '32d7a0b622e6'
down_revision: Union[str, None] = 'fc7edcc0dd19'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('elements', sa.Column('z-index', sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column('elements', 'z-index')
