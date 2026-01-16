from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Database - using direct PostgreSQL connection
    DATABASE_URL: str
    
    # JWT
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS: int = 365
    
    # API
    API_VERSION: str = "v1"
    DEBUG: bool = False
    CORS_ORIGINS: str = "http://localhost:3000"
    
    # Game Logic
    XP_PER_LEVEL_BASE: int = 100
    LEVEL_EXPONENT: float = 0.5
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True
    )
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


# Global settings instance
settings = Settings()