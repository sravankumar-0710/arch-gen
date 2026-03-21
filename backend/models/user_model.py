# filepath: backend/models/user_model.py
# Purpose: User database model for authentication and project ownership

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from database import Base


def _now():
    """Return current UTC time. Used as column default to avoid deprecated datetime.utcnow."""
    return datetime.now(timezone.utc)


class User(Base):
    """User model for authentication and project ownership."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=_now, nullable=False)
    updated_at = Column(DateTime, default=_now, onupdate=_now, nullable=False)

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"