"""Add font_size column

Revision ID: 940224aa3f81
Revises: 3ba50787d5f5
Create Date: 2024-09-12 09:38:28.569304

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '940224aa3f81'
down_revision: Union[str, None] = '3ba50787d5f5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('elements', sa.Column('font_size', sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column('elements', 'font_size')
