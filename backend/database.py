# filepath: backend/database.py
# Purpose: Database connection and session management using SQLAlchemy

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from config import settings

# Create database engine
# settings.database_url is loaded from .env
engine = create_engine(
    settings.database_url,
    # connect_args={"check_same_thread": False} is only needed for SQLite
    connect_args={"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base class for all database models."""
    pass


def get_db():
    """
    FastAPI dependency that provides a database session to routes.
    Ensures the session is closed after the request is finished.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialize the database by creating all tables.
    Importing all models here ensures they are registered with Base.metadata.
    """
    from models import user_model, project_model
    Base.metadata.create_all(bind=engine)
