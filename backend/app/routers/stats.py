from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import date, timedelta

from app.database import get_db
from app import models, schemas
from app.auth import get_current_user
from app.game_logic import GameLogic

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/profile", response_model=schemas.ProfileResponse)
def get_user_profile(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user profile with level progress"""
    
    total_xp = current_user.total_xp
    current_level = current_user.current_level
    
    xp_for_current = GameLogic.xp_for_level(current_level)
    xp_for_next = GameLogic.xp_for_level(current_level + 1)
    xp_in_level = total_xp - xp_for_current
    xp_needed_for_next = xp_for_next - total_xp
    level_progress = GameLogic.level_progress(total_xp)
    
    return {
        "user_id": current_user.id,
        "username": current_user.username,
        "total_xp": total_xp,
        "current_level": current_level,
        "goal_categories": current_user.goal_categories,
        "has_completed_onboarding": current_user.has_completed_onboarding,
        "xp_in_current_level": xp_in_level,
        "xp_needed_for_next_level": xp_needed_for_next,
        "xp_for_current_level": xp_for_current,
        "xp_for_next_level": xp_for_next,
        "level_progress_percentage": level_progress,
        "created_at": current_user.created_at
    }


@router.get("/leaderboard")
def get_leaderboard(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get global leaderboard of top users by XP"""
    
    users = db.query(models.User).order_by(
        models.User.total_xp.desc()
    ).limit(limit).all()
    
    leaderboard = []
    for idx, user in enumerate(users, start=1):
        leaderboard.append({
            "rank": idx,
            "username": user.username,
            "level": user.current_level,
            "total_xp": user.total_xp
        })
    
    return leaderboard


@router.get("/streaks", response_model=List[schemas.StreakResponse])
def get_user_streaks(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all user streaks with quest details"""
    
    streaks = db.query(models.Streak).filter(
        models.Streak.user_id == current_user.id
    ).order_by(models.Streak.current_streak.desc()).all()
    
    result = []
    for streak in streaks:
        quest = streak.quest
        is_active = _is_streak_active(streak.last_completed_date)
        
        result.append({
            "quest_id": quest.id,
            "quest_title": quest.title,
            "quest_category": quest.category,
            "current_streak": streak.current_streak,
            "longest_streak": streak.longest_streak,
            "last_completed_date": streak.last_completed_date,
            "is_active": is_active
        })
    
    return result


@router.get("/progress", response_model=schemas.ProgressResponse)
def get_progress_stats(
    days: int = 30,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get progress statistics for the last N days"""
    
    start_date = date.today() - timedelta(days=days)
    
    runs = db.query(models.DailyRun).filter(
        models.DailyRun.user_id == current_user.id,
        models.DailyRun.date >= start_date
    ).order_by(models.DailyRun.date).all()
    
    total_runs = len(runs)
    locked_runs = sum(1 for run in runs if run.is_locked)
    total_xp_earned = sum(run.total_xp for run in runs)
    perfect_days = sum(1 for run in runs if run.is_perfect)
    
    # XP progression
    xp_progression = [
        {
            "date": run.date,
            "xp": run.total_xp,
            "is_perfect": run.is_perfect,
            "is_locked": run.is_locked
        }
        for run in runs
    ]
    
    # Category breakdown
    category_breakdown = _get_category_breakdown(current_user.id, start_date, db)
    
    return {
        "period_days": days,
        "total_runs": total_runs,
        "completed_runs": locked_runs,
        "total_xp_earned": total_xp_earned,
        "perfect_days": perfect_days,
        "completion_rate": round((locked_runs / days * 100), 2) if days > 0 else 0,
        "perfect_day_rate": round((perfect_days / locked_runs * 100), 2) if locked_runs > 0 else 0,
        "xp_progression": xp_progression,
        "category_breakdown": category_breakdown
    }


@router.get("/heatmap", response_model=schemas.HeatmapResponse)
def get_activity_heatmap(
    days: int = 90,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get activity heatmap data"""
    
    start_date = date.today() - timedelta(days=days)
    
    runs = db.query(models.DailyRun).filter(
        models.DailyRun.user_id == current_user.id,
        models.DailyRun.date >= start_date
    ).order_by(models.DailyRun.date).all()
    
    heatmap = []
    for run in runs:
        xp = run.total_xp
        
        # Categorize activity level
        if xp == 0:
            level = 0
        elif xp < 200:
            level = 1
        elif xp < 400:
            level = 2
        elif xp < 600:
            level = 3
        else:
            level = 4
        
        heatmap.append({
            "date": run.date,
            "xp": xp,
            "level": level,
            "is_locked": run.is_locked,
            "is_perfect": run.is_perfect
        })
    
    return {
        "start_date": start_date,
        "end_date": date.today(),
        "total_days": days,
        "heatmap": heatmap
    }


# Helper functions
def _is_streak_active(last_completed_date: Optional[date]) -> bool:
    """Check if streak is still active (completed today or yesterday)"""
    if not last_completed_date:
        return False
    
    today = date.today()
    days_since = (today - last_completed_date).days
    return days_since <= 1


def _get_category_breakdown(user_id: Any, start_date: date, db: Session) -> List[Dict[str, Any]]:
    """Calculate quest completion by category"""
    
    # Get all completions in date range with quest info
    completions = db.query(
        models.DailyQuestCompletion,
        models.Quest.category
    ).join(
        models.DailyRun,
        models.DailyQuestCompletion.daily_run_id == models.DailyRun.id
    ).join(
        models.Quest,
        models.DailyQuestCompletion.quest_id == models.Quest.id
    ).filter(
        models.DailyRun.user_id == user_id,
        models.DailyRun.date >= start_date
    ).all()
    
    category_totals: Dict[str, int] = {}
    category_completed: Dict[str, int] = {}
    
    for completion, category in completions:
        if category not in category_totals:
            category_totals[category] = 0
            category_completed[category] = 0
        
        category_totals[category] += 1
        if completion.completed:
            category_completed[category] += 1
    
    category_stats = []
    for category in category_totals:
        total = category_totals[category]
        completed = category_completed[category]
        rate = round((completed / total * 100), 2) if total > 0 else 0
        
        category_stats.append({
            "category": category,
            "total_quests": total,
            "completed_quests": completed,
            "completion_rate": rate
        })
    
    return category_stats