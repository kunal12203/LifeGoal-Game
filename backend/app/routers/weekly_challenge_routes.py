from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date

from app.database import get_db
from app.auth import get_current_user
from app import models
from app.services.weekly_challenge_service import WeeklyChallengeService

router = APIRouter(prefix="/weekly-challenge", tags=["weekly-challenge"])


@router.get("/current")
async def get_current_challenge(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current week's challenge and user's status"""
    service = WeeklyChallengeService(db)
    status = await service.get_user_challenge_status(current_user.id)
    
    return status


@router.post("/complete/{challenge_id}")
async def complete_challenge(
    challenge_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Complete the weekly challenge"""
    service = WeeklyChallengeService(db)
    
    try:
        result = await service.complete_challenge(current_user.id, challenge_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/check-unlock")
async def check_unlock(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Manually check if challenge should be unlocked"""
    service = WeeklyChallengeService(db)
    result = await service.check_and_unlock_challenge(current_user.id)
    
    return result


@router.get("/history")
async def get_challenge_history(
    limit: int = 10,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's challenge completion history"""
    service = WeeklyChallengeService(db)
    history = await service.get_challenge_history(current_user.id, limit)
    
    return history