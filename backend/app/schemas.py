from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, date
from enum import Enum
import uuid


# Enums
class QuestCategory(str, Enum):
    ML = "ML"
    CP = "CP"
    HEALTH = "Health"
    MIND = "Mind"
    FINANCE = "Finance"


class QuestDifficulty(str, Enum):
    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"


# User Schemas
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOnboarding(BaseModel):
    goal_categories: List[QuestCategory] = Field(..., min_length=1, max_length=5)


class UserResponse(BaseModel):
    id: uuid.UUID
    username: str
    email: str
    total_xp: int
    current_level: int
    goal_categories: List[str]
    has_completed_onboarding: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


# Quest Schemas
class QuestBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    category: QuestCategory
    difficulty: QuestDifficulty
    base_xp: int = Field(..., ge=0)
    is_core: bool = False


class QuestCreate(QuestBase):
    pass


class QuestResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: Optional[str]
    category: str
    difficulty: str
    base_xp: int
    is_core: bool
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# Daily Run Schemas
class DailyRunCreate(BaseModel):
    date: Optional[date] = None


class QuestCompletionResponse(BaseModel):
    completion_id: uuid.UUID
    quest_id: uuid.UUID
    title: str
    description: Optional[str]
    category: str
    difficulty: str
    base_xp: int
    is_core: bool
    completed: bool
    xp_earned: int
    completed_at: Optional[datetime]


class DailyRunResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    date: date
    total_xp: int
    is_perfect: bool
    is_locked: bool
    completed_at: Optional[datetime]
    created_at: datetime
    quests: List[QuestCompletionResponse]
    
    class Config:
        from_attributes = True


# Streak Schemas
class StreakResponse(BaseModel):
    quest_id: uuid.UUID
    quest_title: str
    quest_category: str
    current_streak: int
    longest_streak: int
    last_completed_date: Optional[date]
    is_active: bool


# Stats Schemas
class ProfileResponse(BaseModel):
    user_id: uuid.UUID
    username: str
    total_xp: int
    current_level: int
    goal_categories: List[str]
    has_completed_onboarding: bool
    xp_in_current_level: int
    xp_needed_for_next_level: int
    xp_for_current_level: int
    xp_for_next_level: int
    level_progress_percentage: float
    created_at: datetime


class XPProgressPoint(BaseModel):
    date: date
    xp: int
    is_perfect: bool
    is_locked: bool


class CategoryBreakdown(BaseModel):
    category: str
    total_quests: int
    completed_quests: int
    completion_rate: float


class ProgressResponse(BaseModel):
    period_days: int
    total_runs: int
    completed_runs: int
    total_xp_earned: int
    perfect_days: int
    completion_rate: float
    perfect_day_rate: float
    xp_progression: List[XPProgressPoint]
    category_breakdown: List[CategoryBreakdown]


class HeatmapPoint(BaseModel):
    date: date
    xp: int
    level: int
    is_locked: bool
    is_perfect: bool


class HeatmapResponse(BaseModel):
    start_date: date
    end_date: date
    total_days: int
    heatmap: List[HeatmapPoint]


# Goal & Milestone Schemas
class MilestoneBase(BaseModel):
    title: str
    order: int

class MilestoneCreate(BaseModel):
    title: str

class MilestoneUpdate(BaseModel):
    title: str

class MilestoneResponse(MilestoneBase):
    id: uuid.UUID
    is_completed: bool

    class Config:
        from_attributes = True

class GoalCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: QuestCategory
    target_date: Optional[date] = None
    milestones: List[str]  # List of milestone titles to create

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[QuestCategory] = None
    target_date: Optional[date] = None

class GoalResponse(BaseModel):
    id: uuid.UUID
    title: str
    category: str
    target_date: Optional[date]
    is_completed: bool
    progress_percentage: float
    milestones: List[MilestoneResponse]

    class Config:
        from_attributes = True