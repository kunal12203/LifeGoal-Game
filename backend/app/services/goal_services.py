from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from fastapi import HTTPException, status
from app import models, schemas
import uuid

class GoalService:
    """Business logic for Epic Quests (Goals) and Milestones using SQLAlchemy"""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def create_goal(self, user_id: str, goal_in: schemas.GoalCreate) -> models.Goal:
        """Create a long-term goal with associated milestones"""
        # 1. Create the Goal record
        db_goal = models.Goal(
            user_id=uuid.UUID(user_id) if isinstance(user_id, str) else user_id,
            title=goal_in.title,
            description=goal_in.description,
            category=goal_in.category.value if hasattr(goal_in.category, 'value') else goal_in.category,
            target_date=goal_in.target_date,
            is_completed=False,
            xp_reward=500
        )
        self.db.add(db_goal)
        self.db.flush()  # Get goal ID before creating milestones

        # 2. Create Milestones from titles
        if goal_in.milestones:
            for index, title in enumerate(goal_in.milestones):
                db_milestone = models.Milestone(
                    goal_id=db_goal.id,
                    title=title,
                    order=index,
                    is_completed=False
                )
                self.db.add(db_milestone)
        
        self.db.commit()
        self.db.refresh(db_goal)
        return db_goal

    async def get_user_goals(self, user_id: str) -> List[models.Goal]:
        """Fetch all goals for a specific user"""
        user_uuid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
        return self.db.query(models.Goal).filter(
            models.Goal.user_id == user_uuid
        ).order_by(models.Goal.created_at.desc()).all()

    async def toggle_milestone(self, milestone_id: str, user_id: str) -> models.Goal:
        """Toggle a milestone and check if the parent goal is now complete"""
        user_uuid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
        milestone_uuid = uuid.UUID(milestone_id) if isinstance(milestone_id, str) else milestone_id
        
        milestone = self.db.query(models.Milestone).join(models.Goal).filter(
            models.Milestone.id == milestone_uuid,
            models.Goal.user_id == user_uuid
        ).first()

        if not milestone:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Milestone not found or unauthorized"
            )

        # Toggle completion
        milestone.is_completed = not milestone.is_completed
        
        # Check if all milestones for this goal are now complete
        parent_goal = milestone.goal
        all_milestones = parent_goal.milestones
        parent_goal.is_completed = all(m.is_completed for m in all_milestones)
        
        # Award XP if goal just completed
        if parent_goal.is_completed:
            user = self.db.query(models.User).filter(models.User.id == user_uuid).first()
            if user:
                user.total_xp += parent_goal.xp_reward
                # Update level based on new XP
                from app.game_logic import GameLogic
                user.current_level = GameLogic.calculate_level(user.total_xp)
        
        self.db.commit()
        self.db.refresh(parent_goal)
        return parent_goal

    async def get_goal_details(self, goal_id: str, user_id: str) -> models.Goal:
        """Fetch a specific goal with all milestones attached"""
        user_uuid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
        goal_uuid = uuid.UUID(goal_id) if isinstance(goal_id, str) else goal_id
        
        goal = self.db.query(models.Goal).filter(
            models.Goal.id == goal_uuid,
            models.Goal.user_id == user_uuid
        ).first()
        
        if not goal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Goal not found"
            )
        return goal

    async def update_goal(self, goal_id: str, user_id: str, goal_update: schemas.GoalUpdate) -> models.Goal:
        """Update goal title, description, category, or target date"""
        user_uuid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
        goal_uuid = uuid.UUID(goal_id) if isinstance(goal_id, str) else goal_id
        
        goal = self.db.query(models.Goal).filter(
            models.Goal.id == goal_uuid,
            models.Goal.user_id == user_uuid
        ).first()
        
        if not goal:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
        
        # Update fields if provided
        if goal_update.title is not None:
            goal.title = goal_update.title
        if goal_update.description is not None:
            goal.description = goal_update.description
        if goal_update.category is not None:
            goal.category = goal_update.category.value if hasattr(goal_update.category, 'value') else goal_update.category
        if goal_update.target_date is not None:
            goal.target_date = goal_update.target_date
        
        self.db.commit()
        self.db.refresh(goal)
        return goal

    async def delete_goal(self, goal_id: str, user_id: str) -> dict:
        """Delete a goal and all its milestones"""
        user_uuid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
        goal_uuid = uuid.UUID(goal_id) if isinstance(goal_id, str) else goal_id
        
        goal = self.db.query(models.Goal).filter(
            models.Goal.id == goal_uuid,
            models.Goal.user_id == user_uuid
        ).first()
        
        if not goal:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
        
        # Delete all milestones first
        self.db.query(models.Milestone).filter(models.Milestone.goal_id == goal_uuid).delete()
        
        # Delete the goal
        self.db.delete(goal)
        self.db.commit()
        
        return {"message": "Goal deleted successfully", "goal_id": str(goal_id)}

    async def add_milestone(self, goal_id: str, user_id: str, milestone_title: str) -> models.Goal:
        """Add a new milestone to an existing goal"""
        user_uuid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
        goal_uuid = uuid.UUID(goal_id) if isinstance(goal_id, str) else goal_id
        
        goal = self.db.query(models.Goal).filter(
            models.Goal.id == goal_uuid,
            models.Goal.user_id == user_uuid
        ).first()
        
        if not goal:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
        
        # Get the current max order
        max_order = self.db.query(models.Milestone).filter(
            models.Milestone.goal_id == goal_uuid
        ).count()
        
        # Create new milestone
        new_milestone = models.Milestone(
            goal_id=goal_uuid,
            title=milestone_title,
            order=max_order,
            is_completed=False
        )
        
        self.db.add(new_milestone)
        self.db.commit()
        self.db.refresh(goal)
        return goal

    async def update_milestone(self, milestone_id: str, user_id: str, new_title: str) -> models.Milestone:
        """Update milestone title"""
        user_uuid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
        milestone_uuid = uuid.UUID(milestone_id) if isinstance(milestone_id, str) else milestone_id
        
        milestone = self.db.query(models.Milestone).join(models.Goal).filter(
            models.Milestone.id == milestone_uuid,
            models.Goal.user_id == user_uuid
        ).first()

        if not milestone:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")
        
        milestone.title = new_title
        self.db.commit()
        self.db.refresh(milestone)
        return milestone

    async def delete_milestone(self, milestone_id: str, user_id: str) -> dict:
        """Delete a milestone"""
        user_uuid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
        milestone_uuid = uuid.UUID(milestone_id) if isinstance(milestone_id, str) else milestone_id
        
        milestone = self.db.query(models.Milestone).join(models.Goal).filter(
            models.Milestone.id == milestone_uuid,
            models.Goal.user_id == user_uuid
        ).first()

        if not milestone:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")
        
        goal_id = milestone.goal_id
        self.db.delete(milestone)
        self.db.commit()
        
        return {"message": "Milestone deleted successfully", "milestone_id": str(milestone_id), "goal_id": str(goal_id)}