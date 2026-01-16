from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional, Dict
from datetime import date, datetime
from fastapi import HTTPException, status
from app import models, schemas
from app.game_logic import AntiCheat, StreakCalculator, GameLogic
import uuid

class DailyRunService:
    """Business logic for daily runs using SQLAlchemy"""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def create_daily_run(
        self,
        user_id: uuid.UUID,
        run_date: date,
        goal_categories: List[str]
    ) -> models.DailyRun:
        """Create a new daily run with filtered quest completions"""
        
        # 1. Validate backfill limits
        can_create, reason = AntiCheat.validate_backfill(run_date, date.today())
        if not can_create:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=reason
            )
        
        # 2. Check if run already exists for this user and date
        existing = self.db.query(models.DailyRun).filter(
            models.DailyRun.user_id == user_id,
            models.DailyRun.date == run_date
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Daily run for {run_date} already exists"
            )
        
        # 3. Initialize the Daily Run record
        daily_run = models.DailyRun(
            user_id=user_id,
            date=run_date,
            total_xp=0,
            is_perfect=False,
            is_locked=False
        )
        self.db.add(daily_run)
        self.db.flush() # Secure the ID for completions
        
        # 4. Get and filter quests based on user categories
        quests = await self._get_filtered_quests(goal_categories)
        
        # 5. Create quest completion trackers for this run
        for quest in quests:
            completion = models.DailyQuestCompletion(
                daily_run_id=daily_run.id,
                quest_id=quest.id,
                completed=False,
                xp_earned=0
            )
            self.db.add(completion)
        
        self.db.commit()
        self.db.refresh(daily_run)
        return daily_run

    async def get_run_by_date(self, user_id: uuid.UUID, run_date: date) -> Optional[models.DailyRun]:
        """Fetch a specific daily run by date"""
        return self.db.query(models.DailyRun).filter(
            models.DailyRun.user_id == user_id,
            models.DailyRun.date == run_date
        ).first()

    async def toggle_quest_completion(
        self,
        run_id: uuid.UUID,
        completion_id: uuid.UUID,
        user_id: uuid.UUID
    ) -> Dict:
        """Toggle a specific quest status and update XP/Streaks"""
        
        # 1. Verify run ownership and editability
        run = self.db.query(models.DailyRun).filter(
            models.DailyRun.id == run_id,
            models.DailyRun.user_id == user_id
        ).first()
        
        if not run:
            raise HTTPException(status_code=404, detail="Daily run not found")
            
        can_edit, reason = AntiCheat.can_edit_run(run.date, run.is_locked, date.today())
        if not can_edit:
            raise HTTPException(status_code=403, detail=reason)
        
        # 2. Toggle the completion
        completion = self.db.query(models.DailyQuestCompletion).filter(
            models.DailyQuestCompletion.id == completion_id,
            models.DailyQuestCompletion.daily_run_id == run_id
        ).first()
        
        if not completion:
            raise HTTPException(status_code=404, detail="Completion record not found")
            
        quest = completion.quest
        completion.completed = not completion.completed
        completion.xp_earned = quest.base_xp if completion.completed else 0
        completion.completed_at = datetime.utcnow() if completion.completed else None
        
        # 3. Recalculate Run totals
        completions = self.db.query(models.DailyQuestCompletion).filter(
            models.DailyQuestCompletion.daily_run_id == run_id
        ).all()
        run.total_xp = sum(c.xp_earned for c in completions)
        run.is_perfect = all(c.completed for c in completions)
        
        # 4. Handle Core Quest Streaks
        if quest.is_core and completion.completed:
            await self._update_streak(user_id, quest.id, run.date)
            
        self.db.commit()
        return {
            "completed": completion.completed,
            "xp_earned": completion.xp_earned,
            "run_total_xp": run.total_xp
        }

    async def complete_run(self, run_id: uuid.UUID, user_id: uuid.UUID) -> models.DailyRun:
        """Finalize and lock a daily run to calculate Level gains"""
        run = self.db.query(models.DailyRun).filter(
            models.DailyRun.id == run_id,
            models.DailyRun.user_id == user_id
        ).first()
        
        if not run or run.is_locked:
            raise HTTPException(status_code=400, detail="Run not found or already locked")
            
        can_complete, reason = AntiCheat.can_complete_run(run.date, date.today())
        if not can_complete:
            raise HTTPException(status_code=403, detail=reason)
            
        run.is_locked = True
        run.completed_at = datetime.utcnow()
        
        # Update User level info
        user = run.user
        total_xp = self.db.query(models.func.sum(models.DailyRun.total_xp)).filter(
            models.DailyRun.user_id == user_id,
            models.DailyRun.is_locked == True
        ).scalar() or 0
        
        user.total_xp = total_xp
        user.current_level = GameLogic.calculate_level(total_xp)
        
        self.db.commit()
        return run

    async def _get_filtered_quests(self, categories: List[str]) -> List[models.Quest]:
        """Helper to find relevant quests based on user preferences"""
        query = self.db.query(models.Quest).filter(models.Quest.is_active == True)
        
        if categories:
            query = query.filter(models.Quest.category.in_(categories))
            
        quests = query.all()
        if not quests: # Fallback
            quests = self.db.query(models.Quest).filter(
                models.Quest.is_active == True,
                models.Quest.is_core == True
            ).all()
        return quests

    async def _update_streak(self, user_id: uuid.UUID, quest_id: uuid.UUID, completion_date: date):
        """Internal logic for streak calculation"""
        streak = self.db.query(models.Streak).filter(
            models.Streak.user_id == user_id,
            models.Streak.quest_id == quest_id
        ).first()
        
        if streak:
            new_curr, new_long = StreakCalculator.update_streak(
                streak.current_streak,
                streak.longest_streak,
                streak.last_completed_date,
                completion_date
            )
            streak.current_streak = new_curr
            streak.longest_streak = new_long
            streak.last_completed_date = completion_date
        else:
            new_streak = models.Streak(
                user_id=user_id,
                quest_id=quest_id,
                current_streak=1,
                longest_streak=1,
                last_completed_date=completion_date
            )
            self.db.add(new_streak)