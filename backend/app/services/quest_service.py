from sqlalchemy.orm import Session
from typing import List, Optional
from app import models, schemas
from fastapi import HTTPException, status
import uuid

class QuestService:
    """Business logic for quest management using SQLAlchemy"""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def get_all_active_quests(self) -> List[models.Quest]:
        """Get all active quests ordered by category and XP"""
        return self.db.query(models.Quest).filter(
            models.Quest.is_active == True
        ).order_by(models.Quest.category, models.Quest.base_xp.desc()).all()
    
    async def get_quests_by_categories(self, categories: List[str]) -> List[models.Quest]:
        """Get active quests filtered by user-selected categories"""
        if not categories:
            return await self.get_all_active_quests()
        
        quests = self.db.query(models.Quest).filter(
            models.Quest.is_active == True,
            models.Quest.category.in_(categories)
        ).order_by(models.Quest.base_xp.desc()).all()
        
        # Fallback to core quests if no category-specific quests exist
        if not quests:
            return await self.get_core_quests()
        
        return quests
    
    async def get_core_quests(self) -> List[models.Quest]:
        """Get only core quests that affect streaks"""
        return self.db.query(models.Quest).filter(
            models.Quest.is_active == True,
            models.Quest.is_core == True
        ).order_by(models.Quest.base_xp.desc()).all()
    
    async def get_quest_by_id(self, quest_id: str) -> Optional[models.Quest]:
        """Get a specific quest by its UUID"""
        return self.db.query(models.Quest).filter(models.Quest.id == quest_id).first()
    
    async def create_quest(self, quest_data: schemas.QuestCreate) -> models.Quest:
        """Create a new quest record"""
        db_quest = models.Quest(
            title=quest_data.title,
            description=quest_data.description,
            category=quest_data.category,
            difficulty=quest_data.difficulty,
            base_xp=quest_data.base_xp,
            is_core=quest_data.is_core,
            is_active=True
        )
        self.db.add(db_quest)
        self.db.commit()
        self.db.refresh(db_quest)
        return db_quest
    
    async def deactivate_quest(self, quest_id: str) -> bool:
        """Soft delete a quest by setting is_active to False"""
        quest = await self.get_quest_by_id(quest_id)
        if not quest:
            return False
        
        quest.is_active = False
        self.db.commit()
        return True