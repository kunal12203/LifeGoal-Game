"""add last_activity_date to users

Revision ID: add_xp_decay
Revises: previous_revision
Create Date: 2026-01-17

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import func


# revision identifiers, used by Alembic.
revision = 'add_xp_decay'
down_revision = 'previous_revision'  # Replace with your latest migration
branch_labels = None
depends_on = None


def upgrade():
    # Add last_activity_date column
    op.add_column('users', 
        sa.Column('last_activity_date', sa.Date(), server_default=func.current_date(), nullable=False)
    )
    
    # Add decay_history table to track XP losses
    op.create_table('xp_decay_history',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('decay_date', sa.Date(), nullable=False),
        sa.Column('days_inactive', sa.Integer(), nullable=False),
        sa.Column('xp_before', sa.Integer(), nullable=False),
        sa.Column('xp_lost', sa.Integer(), nullable=False),
        sa.Column('xp_after', sa.Integer(), nullable=False),
        sa.Column('level_before', sa.Integer(), nullable=False),
        sa.Column('level_after', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE')
    )
    
    op.create_index('idx_decay_history_user_date', 'xp_decay_history', ['user_id', 'decay_date'])


def downgrade():
    op.drop_index('idx_decay_history_user_date', table_name='xp_decay_history')
    op.drop_table('xp_decay_history')
    op.drop_column('users', 'last_activity_date')