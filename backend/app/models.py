from sqlalchemy import Column, String, Integer, Boolean, DateTime, Date, ForeignKey, Text, JSON, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime, date
import uuid

from app.database import Base

class Goal(Base):
    """Long-term 'Epic Quests'"""
    __tablename__ = "goals"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    category = Column(String(50), nullable=False) # ML, CP, Health, etc.
    
    target_date = Column(Date)
    is_completed = Column(Boolean, default=False)
    xp_reward = Column(Integer, default=500) # Massive XP for finishing a long-term goal
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    milestones = relationship("Milestone", back_populates="goal", cascade="all, delete-orphan")

class Milestone(Base):
    """Short-term checkpoints within a Goal"""
    __tablename__ = "milestones"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    goal_id = Column(UUID(as_uuid=True), ForeignKey("goals.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    order = Column(Integer, nullable=False) # To sequence them in a "path"
    is_completed = Column(Boolean, default=False)
    
    # Relationships
    goal = relationship("Goal", back_populates="milestones")

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    
    total_xp = Column(Integer, default=0, nullable=False)
    current_level = Column(Integer, default=1, nullable=False)
    goal_categories = Column(JSON, default=list, nullable=False)  # ['ML', 'CP', ...]
    has_completed_onboarding = Column(Boolean, default=False, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    daily_runs = relationship("DailyRun", back_populates="user", cascade="all, delete-orphan")
    streaks = relationship("Streak", back_populates="user", cascade="all, delete-orphan")


class Quest(Base):
    __tablename__ = "quests"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    category = Column(String(50), nullable=False, index=True)  # ML, CP, Health, Mind, Finance
    difficulty = Column(String(20), nullable=False)  # Easy, Medium, Hard
    base_xp = Column(Integer, nullable=False)
    is_core = Column(Boolean, default=False, nullable=False)  # Core quests affect streaks
    is_active = Column(Boolean, default=True, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    completions = relationship("DailyQuestCompletion", back_populates="quest")
    streaks = relationship("Streak", back_populates="quest")
    parent_goal_id = Column(UUID(as_uuid=True), ForeignKey("goals.id"), nullable=True)
    
    __table_args__ = (
        Index('idx_quest_category_active', 'category', 'is_active'),
    )


class DailyRun(Base):
    __tablename__ = "daily_runs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    
    total_xp = Column(Integer, default=0, nullable=False)
    is_perfect = Column(Boolean, default=False, nullable=False)  # All quests completed
    is_locked = Column(Boolean, default=False, nullable=False)  # Cannot edit after lock
    
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="daily_runs")
    quest_completions = relationship("DailyQuestCompletion", back_populates="daily_run", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_daily_run_user_date', 'user_id', 'date', unique=True),
        Index('idx_daily_run_date', 'date'),
    )


class DailyQuestCompletion(Base):
    __tablename__ = "daily_quest_completions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    daily_run_id = Column(UUID(as_uuid=True), ForeignKey("daily_runs.id", ondelete="CASCADE"), nullable=False)
    quest_id = Column(UUID(as_uuid=True), ForeignKey("quests.id", ondelete="CASCADE"), nullable=False)
    
    completed = Column(Boolean, default=False, nullable=False)
    xp_earned = Column(Integer, default=0, nullable=False)
    completed_at = Column(DateTime(timezone=True))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    daily_run = relationship("DailyRun", back_populates="quest_completions")
    quest = relationship("Quest", back_populates="completions")
    
    __table_args__ = (
        Index('idx_completion_run_quest', 'daily_run_id', 'quest_id', unique=True),
    )


class Streak(Base):
    __tablename__ = "streaks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    quest_id = Column(UUID(as_uuid=True), ForeignKey("quests.id", ondelete="CASCADE"), nullable=False)
    
    current_streak = Column(Integer, default=0, nullable=False)
    longest_streak = Column(Integer, default=0, nullable=False)
    last_completed_date = Column(Date)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="streaks")
    quest = relationship("Quest", back_populates="streaks")
    
    __table_args__ = (
        Index('idx_streak_user_quest', 'user_id', 'quest_id', unique=True),
        Index('idx_streak_current', 'user_id', 'current_streak'),
    )