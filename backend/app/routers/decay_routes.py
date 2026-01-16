from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.services.xp_decay_service import XPDecayService
from app.auth import get_current_user
from app import schemas, models
from datetime import date

router = APIRouter(prefix="/decay", tags=["xp-decay"])

@router.post("/run-all")
async def trigger_decay_for_all(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Manually trigger decay process for all users.
    In production, this should be restricted to admin users only.
    For testing, it's open to authenticated users.
    """
    decay_service = XPDecayService(db)
    
    # Run in background to avoid timeout
    background_tasks.add_task(decay_service.process_decay_for_all_users)
    
    return {
        "message": "Decay process started in background",
        "triggered_at": date.today().isoformat()
    }

@router.get("/status")
async def get_decay_status(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user's current decay status and potential impact.
    Shows if decay will happen and how much XP would be lost.
    """
    decay_service = XPDecayService(db)
    
    potential_decay = await decay_service.calculate_potential_decay(current_user.id)
    days_until_decay = await decay_service.get_days_until_decay(current_user.id)
    
    return {
        "last_activity_date": current_user.last_activity_date.isoformat(),
        "days_until_decay": days_until_decay,
        "is_currently_safe": not potential_decay.get("will_decay", False),
        "potential_decay": potential_decay
    }

@router.get("/history")
async def get_decay_history(
    limit: int = 30,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's decay history"""
    decay_service = XPDecayService(db)
    history = await decay_service.get_user_decay_history(current_user.id, limit)
    
    return [
        {
            "decay_date": record.decay_date.isoformat(),
            "days_inactive": record.days_inactive,
            "xp_before": record.xp_before,
            "xp_lost": record.xp_lost,
            "xp_after": record.xp_after,
            "level_before": record.level_before,
            "level_after": record.level_after,
            "level_dropped": record.level_before > record.level_after
        }
        for record in history
    ]