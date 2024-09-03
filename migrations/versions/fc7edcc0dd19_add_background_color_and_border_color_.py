"""Add background_color and border_color to elements

Revision ID: fc7edcc0dd19
Revises: 
Create Date: 2024-09-03 13:00:16.002638

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fc7edcc0dd19'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('elements', sa.Column('background_color', sa.String(), nullable=True))
    op.add_column('elements', sa.Column('border_color', sa.String(), nullable=True))

def downgrade() -> None:
    op.drop_column('elements', 'background_color')
    op.drop_column('elements', 'border_color')
