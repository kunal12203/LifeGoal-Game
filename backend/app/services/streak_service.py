from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from datetime import date
from app import models
import uuid

class StreakService:
    """Business logic for streaks using SQLAlchemy sessions"""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def get_user_streaks(self, user_id: uuid.UUID) -> List[Dict]:
        """Get all user streaks with quest details attached"""
        streaks = self.db.query(models.Streak).filter(
            models.Streak.user_id == user_id
        ).order_by(models.Streak.current_streak.desc()).all()
        
        result = []
        for s in streaks:
            result.append({
                "quest_id": s.quest_id,
                "quest_title": s.quest.title,
                "quest_category": s.quest.category,
                "current_streak": s.current_streak,
                "longest_streak": s.longest_streak,
                "last_completed_date": s.last_completed_date,
                "is_active": self._is_streak_active(s.last_completed_date)
            })
        return result
    
    async def get_active_streaks(self, user_id: uuid.UUID) -> List[Dict]:
        """Get only streaks completed today or yesterday"""
        all_streaks = await self.get_user_streaks(user_id)
        return [s for s in all_streaks if s["is_active"]]
    
    async def get_streak_summary(self, user_id: uuid.UUID) -> Dict:
        """Calculate summary statistics for user streaks"""
        streaks = self.db.query(models.Streak).filter(models.Streak.user_id == user_id).all()
        active_count = sum(1 for s in streaks if self._is_streak_active(s.last_completed_date))
        
        total_current = sum(s.current_streak for s in streaks)
        max_streak = max((s.longest_streak for s in streaks), default=0)
        
        return {
            "total_streaks": len(streaks),
            "active_streaks": active_count,
            "total_current_streak_days": total_current,
            "longest_individual_streak": max_streak
        }
    
    def _is_streak_active(self, last_completed_date: Optional[date]) -> bool:
        """Check if a streak is still alive based on the current date"""
        if not last_completed_date:
            return False
        days_since = (date.today() - last_completed_date).days
        return days_since <= 1

    async def reset_broken_streaks(self, user_id: uuid.UUID):
        """Reset streaks to zero if a day was missed; intended for cron jobs"""
        streaks = self.db.query(models.Streak).filter(
            models.Streak.user_id == user_id,
            models.Streak.current_streak > 0
        ).all()
        
        for s in streaks:
            if not self._is_streak_active(s.last_completed_date):
                s.current_streak = 0
        
        self.db.commit()