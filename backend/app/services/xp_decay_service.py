from sqlalchemy.orm import Session
from datetime import date, timedelta
from typing import List, Dict
import uuid

from app import models
from app.game_logic import GameLogic


class XPDecayService:
    """Service for handling XP decay due to inactivity"""
    
    DECAY_RATE = 0.05  # 5% per day
    GRACE_PERIOD_DAYS = 0  # No grace period - decay starts after 1 day
    
    def __init__(self, db: Session):
        self.db = db
    
    async def process_decay_for_all_users(self) -> Dict[str, int]:
        """
        Run daily decay process for all users.
        Called by cron job at midnight.
        
        Returns:
            Dict with processing stats
        """
        today = date.today()
        users = self.db.query(models.User).all()
        
        stats = {
            "total_users": len(users),
            "users_decayed": 0,
            "total_xp_lost": 0,
            "levels_dropped": 0
        }
        
        for user in users:
            decay_result = await self._process_user_decay(user, today)
            if decay_result:
                stats["users_decayed"] += 1
                stats["total_xp_lost"] += decay_result["xp_lost"]
                if decay_result["level_dropped"]:
                    stats["levels_dropped"] += 1
        
        self.db.commit()
        return stats
    
    async def _process_user_decay(self, user: models.User, today: date) -> Dict | None:
        """
        Process decay for a single user.
        
        Returns:
            Dict with decay info if decay occurred, None otherwise
        """
        days_inactive = (today - user.last_activity_date).days
        
        # No decay if user was active today or within grace period
        if days_inactive <= self.GRACE_PERIOD_DAYS:
            return None
        
        # Calculate decay
        xp_before = user.total_xp
        level_before = user.current_level
        
        # Lose 5% per day of inactivity
        decay_multiplier = (1 - self.DECAY_RATE) ** days_inactive
        xp_lost = int(xp_before * (1 - decay_multiplier))
        
        # Apply decay
        user.total_xp = max(0, xp_before - xp_lost)
        user.current_level = GameLogic.calculate_level(user.total_xp)
        
        level_after = user.current_level
        
        # Record decay history
        decay_record = models.XPDecayHistory(
            user_id=user.id,
            decay_date=today,
            days_inactive=days_inactive,
            xp_before=xp_before,
            xp_lost=xp_lost,
            xp_after=user.total_xp,
            level_before=level_before,
            level_after=level_after
        )
        self.db.add(decay_record)
        
        return {
            "xp_lost": xp_lost,
            "level_dropped": level_before > level_after,
            "level_before": level_before,
            "level_after": level_after
        }
    
    async def update_user_activity(self, user_id: uuid.UUID) -> None:
        """
        Update user's last activity date to today.
        Call this when user completes any quest or locks a daily run.
        """
        user = self.db.query(models.User).filter(models.User.id == user_id).first()
        if user:
            user.last_activity_date = date.today()
            self.db.commit()
    
    async def get_user_decay_history(self, user_id: uuid.UUID, limit: int = 30) -> List[models.XPDecayHistory]:
        """Get user's decay history"""
        return self.db.query(models.XPDecayHistory).filter(
            models.XPDecayHistory.user_id == user_id
        ).order_by(models.XPDecayHistory.decay_date.desc()).limit(limit).all()
    
    async def get_days_until_decay(self, user_id: uuid.UUID) -> int:
        """
        Calculate how many days until decay starts.
        Returns 0 if already decaying.
        """
        user = self.db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            return 0
        
        days_inactive = (date.today() - user.last_activity_date).days
        days_safe = self.GRACE_PERIOD_DAYS - days_inactive
        
        return max(0, days_safe)
    
    async def calculate_potential_decay(self, user_id: uuid.UUID) -> Dict:
        """
        Calculate what would happen if decay runs today.
        Used for showing warnings to users.
        """
        user = self.db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            return {"will_decay": False}
        
        days_inactive = (date.today() - user.last_activity_date).days
        
        if days_inactive <= self.GRACE_PERIOD_DAYS:
            return {
                "will_decay": False,
                "days_safe": self.GRACE_PERIOD_DAYS - days_inactive + 1
            }
        
        # Calculate potential loss
        decay_multiplier = (1 - self.DECAY_RATE) ** days_inactive
        xp_lost = int(user.total_xp * (1 - decay_multiplier))
        new_xp = max(0, user.total_xp - xp_lost)
        new_level = GameLogic.calculate_level(new_xp)
        
        return {
            "will_decay": True,
            "days_inactive": days_inactive,
            "current_xp": user.total_xp,
            "xp_will_lose": xp_lost,
            "xp_after_decay": new_xp,
            "current_level": user.current_level,
            "level_after_decay": new_level,
            "will_drop_level": new_level < user.current_level
        }