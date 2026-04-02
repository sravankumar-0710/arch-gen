# filepath: backend/models/project_model.py
# Purpose: Project database model for storing user floor plan data

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base


def _now():
    """Return current UTC time. Used as column default."""
    return datetime.now(timezone.utc)


class Project(Base):
    """Project model for storing user floor plan layouts and data."""
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), default="Untitled Project", nullable=False)
    description = Column(String(1000), nullable=True)

    # JSON blobs for flexible layout data
    # land_data: polygon points, unit, road side, north angle
    land_data = Column(JSON, nullable=True)
    # requirements: rooms, vastu flags, floors
    requirements = Column(JSON, nullable=True)
    # layout: generated layout result (rooms, walls, score)
    layout = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=_now, nullable=False)
    updated_at = Column(DateTime, default=_now, onupdate=_now, nullable=False)

    # Relationships
    # user = relationship("User", back_populates="projects")

    def __repr__(self):
        return f"<Project(id={self.id}, user_id={self.user_id}, name='{self.name}')>"
