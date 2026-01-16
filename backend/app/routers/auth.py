from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from app.database import get_db
from app import models, schemas
from app.auth import (
    hash_password,
    authenticate_user,
    create_access_token,
    get_current_user
)
from app.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=schemas.UserResponse)
def signup(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register new user"""
    
    # Check if email exists
    if db.query(models.User).filter(models.User.email == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username exists
    if db.query(models.User).filter(models.User.username == user_data.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create user
    user = models.User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        total_xp=0,
        current_level=1,
        goal_categories=[],
        has_completed_onboarding=False
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user


@router.post("/login", response_model=schemas.TokenResponse)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    """Login user and return JWT token"""
    
    user = authenticate_user(db, credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(days=settings.ACCESS_TOKEN_EXPIRE_DAYS)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,  # seconds
        "user": user
    }


@router.post("/onboarding")
def complete_onboarding(
    onboarding_data: schemas.UserOnboarding,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Complete user onboarding by setting goal categories"""
    
    current_user.goal_categories = [cat.value for cat in onboarding_data.goal_categories]
    current_user.has_completed_onboarding = True
    
    db.commit()
    db.refresh(current_user)
    
    return {
        "message": "Onboarding completed successfully",
        "goal_categories": current_user.goal_categories
    }


@router.get("/me", response_model=schemas.UserResponse)
def get_current_user_info(current_user: models.User = Depends(get_current_user)):
    """Get current authenticated user info"""
    return current_user