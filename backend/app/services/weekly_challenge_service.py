from sqlalchemy.orm import Session
from datetime import date, datetime, timedelta
from typing import List, Dict, Optional
import uuid

from app import models


class WeeklyChallengeService:
    """Service for managing weekly boss battles"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def _get_week_dates(self, target_date: date) -> tuple[date, date]:
        """Get Monday and Sunday for the week containing target_date"""
        # Find Monday (0 = Monday, 6 = Sunday)
        days_since_monday = target_date.weekday()
        monday = target_date - timedelta(days=days_since_monday)
        sunday = monday + timedelta(days=6)
        return monday, sunday
    
    async def get_or_create_weekly_challenge(self, target_date: date = None) -> models.WeeklyChallenge:
        """Get or create this week's challenge"""
        if target_date is None:
            target_date = date.today()
        
        monday, sunday = self._get_week_dates(target_date)
        
        # Check if challenge exists
        challenge = self.db.query(models.WeeklyChallenge).filter(
            models.WeeklyChallenge.week_start_date == monday
        ).first()
        
        if challenge:
            return challenge
        
        # Create new challenge
        challenge = models.WeeklyChallenge(
            week_start_date=monday,
            week_end_date=sunday,
            title=f"Weekly Boss Battle: {monday.strftime('%b %d')} - {sunday.strftime('%b %d')}",
            description="Complete ALL core quests Monday-Friday to unlock this epic challenge! Massive XP awaits.",
            xp_reward=1000
        )
        self.db.add(challenge)
        self.db.commit()
        self.db.refresh(challenge)
        
        return challenge
    
    async def check_and_unlock_challenge(self, user_id: uuid.UUID, target_date: date = None) -> Dict:
        """
        Check if user has completed all core quests M-F and unlock challenge.
        Returns unlock status and details.
        """
        if target_date is None:
            target_date = date.today()
        
        monday, sunday = self._get_week_dates(target_date)
        
        # Get this week's challenge
        challenge = await self.get_or_create_weekly_challenge(target_date)
        
        # Get or create user's completion record
        completion = self.db.query(models.WeeklyChallengeCompletion).filter(
            models.WeeklyChallengeCompletion.user_id == user_id,
            models.WeeklyChallengeCompletion.challenge_id == challenge.id
        ).first()
        
        if not completion:
            completion = models.WeeklyChallengeCompletion(
                user_id=user_id,
                challenge_id=challenge.id,
                is_unlocked=False,
                is_completed=False
            )
            self.db.add(completion)
            self.db.flush()
        
        # If already unlocked or completed, return current status
        if completion.is_unlocked:
            return {
                "is_unlocked": True,
                "is_completed": completion.is_completed,
                "challenge": challenge,
                "unlocked_at": completion.unlocked_at
            }
        
        # Check if all M-F core quests are completed
        weekdays = [monday + timedelta(days=i) for i in range(5)]  # Mon-Fri
        
        all_core_completed = True
        for day in weekdays:
            # Get daily run for this day
            daily_run = self.db.query(models.DailyRun).filter(
                models.DailyRun.user_id == user_id,
                models.DailyRun.date == day
            ).first()
            
            if not daily_run or not daily_run.is_locked:
                all_core_completed = False
                break
            
            # Check if all CORE quests in this run are completed
            core_completions = self.db.query(models.DailyQuestCompletion).join(
                models.Quest
            ).filter(
                models.DailyQuestCompletion.daily_run_id == daily_run.id,
                models.Quest.is_core == True
            ).all()
            
            if not all(c.completed for c in core_completions):
                all_core_completed = False
                break
        
        # Unlock if all conditions met
        if all_core_completed:
            completion.is_unlocked = True
            completion.unlocked_at = datetime.utcnow()
            self.db.commit()
            
            return {
                "is_unlocked": True,
                "is_completed": False,
                "challenge": challenge,
                "unlocked_at": completion.unlocked_at,
                "just_unlocked": True  # Flag for showing notification
            }
        
        # Calculate progress
        completed_days = 0
        for day in weekdays:
            daily_run = self.db.query(models.DailyRun).filter(
                models.DailyRun.user_id == user_id,
                models.DailyRun.date == day
            ).first()
            
            if daily_run and daily_run.is_locked:
                core_completions = self.db.query(models.DailyQuestCompletion).join(
                    models.Quest
                ).filter(
                    models.DailyQuestCompletion.daily_run_id == daily_run.id,
                    models.Quest.is_core == True
                ).all()
                
                if all(c.completed for c in core_completions):
                    completed_days += 1
        
        return {
            "is_unlocked": False,
            "is_completed": False,
            "challenge": challenge,
            "days_completed": completed_days,
            "days_required": 5
        }
    
    async def complete_challenge(self, user_id: uuid.UUID, challenge_id: uuid.UUID) -> Dict:
        """Complete the weekly challenge and award XP"""
        completion = self.db.query(models.WeeklyChallengeCompletion).filter(
            models.WeeklyChallengeCompletion.user_id == user_id,
            models.WeeklyChallengeCompletion.challenge_id == challenge_id
        ).first()
        
        if not completion:
            raise ValueError("Challenge completion record not found")
        
        if not completion.is_unlocked:
            raise ValueError("Challenge is not unlocked yet")
        
        if completion.is_completed:
            raise ValueError("Challenge already completed")
        
        # Mark as completed
        completion.is_completed = True
        completion.xp_earned = completion.challenge.xp_reward
        completion.completed_at = datetime.utcnow()
        
        # Update user's total XP
        user = self.db.query(models.User).filter(models.User.id == user_id).first()
        if user:
            user.total_xp += completion.xp_earned
            from app.game_logic import GameLogic
            user.current_level = GameLogic.calculate_level(user.total_xp)
        
        self.db.commit()
        
        return {
            "completed": True,
            "xp_earned": completion.xp_earned,
            "total_xp": user.total_xp,
            "current_level": user.current_level
        }
    
    async def get_user_challenge_status(self, user_id: uuid.UUID, target_date: date = None) -> Dict:
        """Get comprehensive challenge status for user"""
        if target_date is None:
            target_date = date.today()
        
        challenge = await self.get_or_create_weekly_challenge(target_date)
        unlock_status = await self.check_and_unlock_challenge(user_id, target_date)
        
        return {
            "challenge": {
                "id": str(challenge.id),
                "title": challenge.title,
                "description": challenge.description,
                "xp_reward": challenge.xp_reward,
                "week_start": challenge.week_start_date.isoformat(),
                "week_end": challenge.week_end_date.isoformat()
            },
            "status": unlock_status
        }
    
    async def get_challenge_history(self, user_id: uuid.UUID, limit: int = 10) -> List[Dict]:
        """Get user's past challenge completions"""
        completions = self.db.query(models.WeeklyChallengeCompletion).join(
            models.WeeklyChallenge
        ).filter(
            models.WeeklyChallengeCompletion.user_id == user_id,
            models.WeeklyChallengeCompletion.is_completed == True
        ).order_by(
            models.WeeklyChallenge.week_start_date.desc()
        ).limit(limit).all()
        
        return [
            {
                "challenge_title": c.challenge.title,
                "week_start": c.challenge.week_start_date.isoformat(),
                "xp_earned": c.xp_earned,
                "completed_at": c.completed_at.isoformat() if c.completed_at else None
            }
            for c in completions
        ]