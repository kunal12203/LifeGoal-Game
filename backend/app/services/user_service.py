from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Optional
from fastapi import HTTPException, status
from app import models, schemas
from app.services.xp_service import XPService
import uuid

class UserService:
    """Business logic for user management using SQLAlchemy sessions"""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def get_user_profile(self, user_id: uuid.UUID) -> Dict:
        """Get comprehensive user profile with calculated level progress"""
        user = self.db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        level_info = XPService.calculate_level_info(user.total_xp)
        
        return {
            "user_id": user.id,
            "username": user.username,
            "goal_categories": user.goal_categories,
            "has_completed_onboarding": user.has_completed_onboarding,
            **level_info,
            "created_at": user.created_at
        }
    
    async def get_leaderboard(self, limit: int = 10) -> List[Dict]:
        """Fetch global ranking based on total XP"""
        users = self.db.query(models.User).order_by(
            models.User.total_xp.desc()
        ).limit(limit).all()
        
        return [
            {
                "rank": i + 1,
                "username": u.username,
                "level": u.current_level,
                "total_xp": u.total_xp
            } for i, u in enumerate(users)
        ]

    async def update_goal_categories(self, user_id: uuid.UUID, categories: List[str]) -> models.User:
        """Update the user's focus areas for quest filtering"""
        user = self.db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        user.goal_categories = categories
        user.has_completed_onboarding = True
        self.db.commit()
        self.db.refresh(user)
        return user