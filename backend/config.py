# filepath: backend/config.py
# Purpose: Centralized environment configuration — crashes loudly if required vars are missing.

import os
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    App configuration loaded from environment variables.
    Required vars have no defaults — app crashes at startup if they are missing.
    """
    # Required — no defaults, will raise if unset
    database_url: str
    secret_key: str

    # Optional with safe defaults
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    debug: bool = False
    host: str = "127.0.0.1"
    port: int = 8000

    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Return cached settings instance. Called once at startup."""
    return Settings()


# Validate required env vars at import time — crashes loudly if missing
try:
    settings = get_settings()
except Exception as e:
    raise RuntimeError(
        f"Missing required environment variables. Check your .env file.\nDetail: {e}"
    )