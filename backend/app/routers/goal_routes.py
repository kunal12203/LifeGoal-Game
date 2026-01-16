from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.services.goal_services import GoalService
from app import schemas, models

from app.auth import get_current_user  # Your actual auth module

router = APIRouter(prefix="/goals", tags=["goals"])

@router.get("", response_model=List[schemas.GoalResponse])
async def get_user_goals(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all goals for the authenticated user"""
    goal_service = GoalService(db)
    goals = await goal_service.get_user_goals(str(current_user.id))
    return goals

@router.post("", response_model=schemas.GoalResponse, status_code=201)
async def create_goal(
    goal_data: schemas.GoalCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new goal with milestones"""
    goal_service = GoalService(db)
    goal = await goal_service.create_goal(str(current_user.id), goal_data)
    return goal

@router.put("/{goal_id}", response_model=schemas.GoalResponse)
async def update_goal(
    goal_id: str,
    goal_update: schemas.GoalUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update goal details (title, description, category, target_date)"""
    goal_service = GoalService(db)
    goal = await goal_service.update_goal(goal_id, str(current_user.id), goal_update)
    return goal

@router.delete("/{goal_id}")
async def delete_goal(
    goal_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a goal and all its milestones"""
    goal_service = GoalService(db)
    result = await goal_service.delete_goal(goal_id, str(current_user.id))
    return result

@router.post("/milestones/{milestone_id}/toggle", response_model=schemas.GoalResponse)
async def toggle_milestone(
    milestone_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle milestone completion status"""
    goal_service = GoalService(db)
    goal = await goal_service.toggle_milestone(milestone_id, str(current_user.id))
    return goal

@router.post("/{goal_id}/milestones", response_model=schemas.GoalResponse)
async def add_milestone(
    goal_id: str,
    milestone_data: schemas.MilestoneCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a new milestone to a goal"""
    goal_service = GoalService(db)
    goal = await goal_service.add_milestone(goal_id, str(current_user.id), milestone_data.title)
    return goal

@router.put("/milestones/{milestone_id}", response_model=schemas.MilestoneResponse)
async def update_milestone(
    milestone_id: str,
    milestone_update: schemas.MilestoneUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update milestone title"""
    goal_service = GoalService(db)
    milestone = await goal_service.update_milestone(milestone_id, str(current_user.id), milestone_update.title)
    return milestone

@router.delete("/milestones/{milestone_id}")
async def delete_milestone(
    milestone_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a milestone"""
    goal_service = GoalService(db)
    result = await goal_service.delete_milestone(milestone_id, str(current_user.id))
    return result