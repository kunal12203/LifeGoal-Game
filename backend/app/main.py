from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, quests, daily_runs, stats, goals, goal_routes, decay_routes, weekly_challenge_routes

# Initialize FastAPI app
app = FastAPI(
    title="Quest RPG API",
    description="A single-player RPG where real life actions control progression",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(quests.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(daily_runs.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(stats.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(goals.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(goal_routes.router, prefix="/api/v1")
app.include_router(decay_routes.router, prefix="/api/v1")
app.include_router(weekly_challenge_routes.router, prefix="/api/v1")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Quest RPG API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )