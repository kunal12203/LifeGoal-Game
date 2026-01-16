from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.auth import get_current_user
from app.database import get_db
from app import schemas, models
from app.services.goal_services import GoalService

router = APIRouter(prefix="/goals", tags=["Epic Quests"])

@router.post("/", response_model=schemas.GoalResponse)
async def create_new_goal(
    goal_in: schemas.GoalCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = GoalService(db) 
    goal = await service.create_goal(str(current_user.id), goal_in)
    
    # ✅ FIX: Calculate progress_percentage for the response
    total_milestones = len(goal.milestones)
    completed_milestones = sum(1 for m in goal.milestones if m.is_completed)
    progress = (completed_milestones / total_milestones * 100) if total_milestones > 0 else 0
    
    return {
        "id": goal.id,
        "title": goal.title,
        "description": goal.description,
        "category": goal.category,
        "target_date": goal.target_date,
        "is_completed": goal.is_completed,
        "progress_percentage": round(progress, 2),
        "created_at": goal.created_at,
        "milestones": [
            {
                "id": m.id,
                "title": m.title,
                "order": m.order,
                "is_completed": m.is_completed
            }
            for m in sorted(goal.milestones, key=lambda x: x.order)
        ]
    }

@router.get("/", response_model=List[schemas.GoalResponse])
async def list_goals(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = GoalService(db)
    goals = await service.get_user_goals(str(current_user.id))
    
    # Calculate progress for each goal
    result = []
    for goal in goals:
        total_milestones = len(goal.milestones)
        completed_milestones = sum(1 for m in goal.milestones if m.is_completed)
        progress = (completed_milestones / total_milestones * 100) if total_milestones > 0 else 0
        
        result.append({
            "id": goal.id,
            "title": goal.title,
            "description": goal.description,
            "category": goal.category,
            "target_date": goal.target_date,
            "is_completed": goal.is_completed,
            "progress_percentage": round(progress, 2),
            "created_at": goal.created_at,
            "milestones": [
                {
                    "id": m.id,
                    "title": m.title,
                    "order": m.order,
                    "is_completed": m.is_completed
                }
                for m in sorted(goal.milestones, key=lambda x: x.order)
            ]
        })
    
    return result

@router.post("/milestones/{milestone_id}/toggle")
async def toggle_milestone_status(
    milestone_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = GoalService(db)
    goal = await service.toggle_milestone(milestone_id, str(current_user.id))
    
    # Calculate progress
    total_milestones = len(goal.milestones)
    completed_milestones = sum(1 for m in goal.milestones if m.is_completed)
    progress = (completed_milestones / total_milestones * 100) if total_milestones > 0 else 0
    
    return {
        "id": goal.id,
        "title": goal.title,
        "description": goal.description,
        "category": goal.category,
        "target_date": goal.target_date,
        "is_completed": goal.is_completed,
        "progress_percentage": round(progress, 2),
        "created_at": goal.created_at,
        "milestones": [
            {
                "id": m.id,
                "title": m.title,
                "order": m.order,
                "is_completed": m.is_completed
            }
            for m in sorted(goal.milestones, key=lambda x: x.order)
        ]
    }