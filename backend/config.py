# filepath: backend/config.py
# Purpose: Centralized environment configuration and app settings

import os
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    App configuration loaded from environment variables.
    Crashes at startup if required vars are missing.
    """
    # Database
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///archgen.db")

    # Auth
    secret_key: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # Server
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"
    host: str = "127.0.0.1"
    port: int = 8000

    # Frontend (optional, ignored by backend)
    vite_api_base_url: str = os.getenv("VITE_API_BASE_URL", "http://localhost:8000")

    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"


@lru_cache()
def get_settings():
    """Get cached settings instance."""
    return Settings()


# Validate required env vars at startup
settings = get_settings()
