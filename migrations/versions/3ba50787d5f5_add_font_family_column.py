"""Add font-family column

Revision ID: 3ba50787d5f5
Revises: fc7edcc0dd19
Create Date: 2024-09-05 13:54:12.394179

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3ba50787d5f5'
down_revision: Union[str, None] = 'fc7edcc0dd19'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('elements', sa.Column('font_family', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('elements', 'font_family')
