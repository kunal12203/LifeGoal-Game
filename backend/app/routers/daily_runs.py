from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import date, datetime

from app.database import get_db
from app import models, schemas
from app.auth import get_current_user
from app.game_logic import AntiCheat, StreakCalculator, GameLogic

router = APIRouter(prefix="/daily-runs", tags=["daily-runs"])


def _create_daily_run(
    *,
    target_date: date,
    current_user: models.User,
    db: Session
) -> schemas.DailyRunResponse:
    
    # Validate backfill
    can_create, reason = AntiCheat.validate_backfill(target_date, date.today())
    if not can_create:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=reason
        )

    existing = db.query(models.DailyRun).filter(
        models.DailyRun.user_id == current_user.id,
        models.DailyRun.date == target_date
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Daily run for {target_date} already exists"
        )

    daily_run = models.DailyRun(
        user_id=current_user.id,
        date=target_date,
        total_xp=0,
        is_perfect=False,
        is_locked=False
    )

    db.add(daily_run)
    db.flush()

    quest_query = db.query(models.Quest).filter(models.Quest.is_active == True)

    if current_user.goal_categories:
        quest_query = quest_query.filter(
            models.Quest.category.in_(current_user.goal_categories)
        )

    quests = quest_query.all()

    if not quests:
        quests = db.query(models.Quest).filter(
            models.Quest.is_active == True,
            models.Quest.is_core == True
        ).all()

    for quest in quests:
        db.add(models.DailyQuestCompletion(
            daily_run_id=daily_run.id,
            quest_id=quest.id,
            completed=False,
            xp_earned=0
        ))

    db.commit()
    db.refresh(daily_run)

    return _format_daily_run_response(daily_run, db)


@router.post("/start", response_model=schemas.DailyRunResponse)
def start_daily_run(
    run_data: schemas.DailyRunCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_date = run_data.date or date.today()
    return _create_daily_run(
        target_date=target_date,
        current_user=current_user,
        db=db
    )


@router.get("/today", response_model=schemas.DailyRunResponse)
def get_todays_run(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()

    run = db.query(models.DailyRun).filter(
        models.DailyRun.user_id == current_user.id,
        models.DailyRun.date == today
    ).first()

    if run:
        return _format_daily_run_response(run, db)

    return _create_daily_run(
        target_date=today,
        current_user=current_user,
        db=db
    )


@router.get("/{run_id}", response_model=schemas.DailyRunResponse)
def get_daily_run(
    run_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get daily run by ID"""
    
    run = db.query(models.DailyRun).filter(
        models.DailyRun.id == run_id,
        models.DailyRun.user_id == current_user.id
    ).first()
    
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Daily run not found"
        )
    
    return _format_daily_run_response(run, db)


@router.post("/{run_id}/complete-quest/{completion_id}")
def toggle_quest_completion(
    run_id: str,
    completion_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle quest completion status"""
    
    # Get run and verify ownership
    run = db.query(models.DailyRun).filter(
        models.DailyRun.id == run_id,
        models.DailyRun.user_id == current_user.id
    ).first()
    
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Daily run not found"
        )
    
    # Check if run can be edited
    can_edit, reason = AntiCheat.can_edit_run(run.date, run.is_locked, date.today())
    if not can_edit:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=reason
        )
    
    # Get completion with quest
    completion = db.query(models.DailyQuestCompletion).filter(
        models.DailyQuestCompletion.id == completion_id,
        models.DailyQuestCompletion.daily_run_id == run_id
    ).first()
    
    if not completion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quest completion not found"
        )
    
    quest = completion.quest
    
    # Toggle completion
    completion.completed = not completion.completed
    completion.xp_earned = quest.base_xp if completion.completed else 0
    completion.completed_at = datetime.utcnow() if completion.completed else None
    
    # Update run total XP
    _recalculate_run_xp(run, db)
    
    # Update streak if core quest
    if quest.is_core and completion.completed:
        _update_streak(current_user.id, quest.id, run.date, db)
    
    db.commit()
    
    return {
        "message": "Quest completion toggled",
        "completed": completion.completed,
        "xp_earned": completion.xp_earned
    }


@router.post("/{run_id}/complete")
def complete_daily_run(
    run_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Complete (lock) daily run"""
    
    run = db.query(models.DailyRun).filter(
        models.DailyRun.id == run_id,
        models.DailyRun.user_id == current_user.id
    ).first()
    
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Daily run not found"
        )
    
    if run.is_locked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Run is already completed"
        )
    
    # Check if can complete
    can_complete, reason = AntiCheat.can_complete_run(run.date, date.today())
    if not can_complete:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=reason
        )
    
    # Lock the run
    run.is_locked = True
    run.completed_at = datetime.utcnow()
    
    # Update user total XP and level
    _update_user_xp_and_level(current_user, db)
    
    db.commit()
    
    return {
        "message": "Daily run completed successfully",
        "locked": True,
        "completed_at": run.completed_at
    }


@router.get("/history/all", response_model=List[schemas.DailyRunResponse])
def get_run_history(
    limit: int = 30,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's run history"""
    
    runs = db.query(models.DailyRun).filter(
        models.DailyRun.user_id == current_user.id
    ).order_by(models.DailyRun.date.desc()).limit(limit).all()
    
    return [_format_daily_run_response(run, db) for run in runs]


# Helper functions
def _format_daily_run_response(run: models.DailyRun, db: Session) -> Dict[str, Any]:
    """Format daily run with quest details"""
    
    completions = db.query(models.DailyQuestCompletion).filter(
        models.DailyQuestCompletion.daily_run_id == run.id
    ).all()
    
    quests = []
    for completion in completions:
        quest = completion.quest
        quests.append({
            "completion_id": completion.id,
            "quest_id": quest.id,
            "title": quest.title,
            "description": quest.description,
            "category": quest.category,
            "difficulty": quest.difficulty,
            "base_xp": quest.base_xp,
            "is_core": quest.is_core,
            "completed": completion.completed,
            "xp_earned": completion.xp_earned,
            "completed_at": completion.completed_at
        })
    
    return {
        "id": run.id,
        "user_id": run.user_id,
        "date": run.date,
        "total_xp": run.total_xp,
        "is_perfect": run.is_perfect,
        "is_locked": run.is_locked,
        "completed_at": run.completed_at,
        "created_at": run.created_at,
        "quests": quests
    }


def _recalculate_run_xp(run: models.DailyRun, db: Session) -> None:
    """Recalculate daily run total XP and perfect status"""
    
    completions = db.query(models.DailyQuestCompletion).filter(
        models.DailyQuestCompletion.daily_run_id == run.id
    ).all()
    
    run.total_xp = sum(c.xp_earned for c in completions)
    run.is_perfect = all(c.completed for c in completions) if completions else False


def _update_user_xp_and_level(user: models.User, db: Session) -> None:
    """Update user's total XP and level from locked runs"""
    
    locked_runs = db.query(models.DailyRun).filter(
        models.DailyRun.user_id == user.id,
        models.DailyRun.is_locked == True
    ).all()
    
    user.total_xp = sum(run.total_xp for run in locked_runs)
    user.current_level = GameLogic.calculate_level(user.total_xp)


def _update_streak(user_id: Any, quest_id: Any, completion_date: date, db: Session) -> None:
    """Update streak for a core quest"""
    
    streak = db.query(models.Streak).filter(
        models.Streak.user_id == user_id,
        models.Streak.quest_id == quest_id
    ).first()
    
    if streak:
        new_current, new_longest = StreakCalculator.update_streak(
            streak.current_streak,
            streak.longest_streak,
            streak.last_completed_date,
            completion_date
        )
        
        streak.current_streak = new_current
        streak.longest_streak = new_longest
        streak.last_completed_date = completion_date
    else:
        streak = models.Streak(
            user_id=user_id,
            quest_id=quest_id,
            current_streak=1,
            longest_streak=1,
            last_completed_date=completion_date
        )
        db.add(streak)