from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models, schemas
from app.auth import get_current_user

router = APIRouter(prefix="/quests", tags=["quests"])


@router.get("/", response_model=List[schemas.QuestResponse])
def get_all_quests(db: Session = Depends(get_db)):
    """Get all active quests"""
    quests = db.query(models.Quest).filter(
        models.Quest.is_active == True
    ).order_by(models.Quest.category, models.Quest.base_xp.desc()).all()
    
    return quests


@router.get("/core", response_model=List[schemas.QuestResponse])
def get_core_quests(db: Session = Depends(get_db)):
    """Get only core quests (affect streaks)"""
    quests = db.query(models.Quest).filter(
        models.Quest.is_active == True,
        models.Quest.is_core == True
    ).order_by(models.Quest.base_xp.desc()).all()
    
    return quests


@router.get("/{quest_id}", response_model=schemas.QuestResponse)
def get_quest(quest_id: str, db: Session = Depends(get_db)):
    """Get specific quest by ID"""
    quest = db.query(models.Quest).filter(models.Quest.id == quest_id).first()
    
    if not quest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quest not found"
        )
    
    return quest


@router.post("/", response_model=schemas.QuestResponse, status_code=status.HTTP_201_CREATED)
def create_quest(
    quest_data: schemas.QuestCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new quest (admin only - add role check in production)"""
    
    quest = models.Quest(
        title=quest_data.title,
        description=quest_data.description,
        category=quest_data.category.value,
        difficulty=quest_data.difficulty.value,
        base_xp=quest_data.base_xp,
        is_core=quest_data.is_core,
        is_active=True
    )
    
    db.add(quest)
    db.commit()
    db.refresh(quest)
    
    return quest