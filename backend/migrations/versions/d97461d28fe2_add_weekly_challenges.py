"""add weekly challenges

Revision ID: d97461d28fe2
Revises: add_xp_decay
Create Date: 2026-01-17 04:57:56.212384

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import func




# revision identifiers, used by Alembic.
revision: str = 'd97461d28fe2'
down_revision: Union[str, Sequence[str], None] = 'add_xp_decay'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Create weekly_challenges table
    op.create_table('weekly_challenges',
        sa.Column('id', UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('week_start_date', sa.Date(), nullable=False),
        sa.Column('week_end_date', sa.Date(), nullable=False),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('xp_reward', sa.Integer(), server_default='1000', nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('week_start_date')
    )
    
    # Create weekly_challenge_completions table
    op.create_table('weekly_challenge_completions',
        sa.Column('id', UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('user_id', UUID(), nullable=False),
        sa.Column('challenge_id', UUID(), nullable=False),
        sa.Column('is_unlocked', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('is_completed', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('xp_earned', sa.Integer(), server_default='0', nullable=False),
        sa.Column('unlocked_at', sa.DateTime(timezone=True)),
        sa.Column('completed_at', sa.DateTime(timezone=True)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['challenge_id'], ['weekly_challenges.id'], ondelete='CASCADE')
    )
    
    op.create_index('idx_weekly_challenge_dates', 'weekly_challenges', ['week_start_date', 'week_end_date'])
    op.create_index('idx_weekly_completion_user_challenge', 'weekly_challenge_completions', ['user_id', 'challenge_id'], unique=True)

def downgrade():
    op.drop_index('idx_weekly_completion_user_challenge', table_name='weekly_challenge_completions')
    op.drop_index('idx_weekly_challenge_dates', table_name='weekly_challenges')
    op.drop_table('weekly_challenge_completions')
    op.drop_table('weekly_challenges')


