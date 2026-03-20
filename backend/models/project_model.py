# filepath: backend/models/project_model.py
# Purpose: Project database model for storing user designs

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base


class Project(Base):
    """Project model for storing floor plan designs."""
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=True)

    # JSON columns store nested data structures
    land_data = Column(JSON, nullable=True)          # Polygon, units, orientation, road side
    requirements = Column(JSON, nullable=True)       # Room types, counts, constraints
    layout = Column(JSON, nullable=True)             # Generated layout: rooms, walls, positions

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationship (for future use)
    # user = relationship("User", back_populates="projects")

    def __repr__(self):
        return f"<Project(id={self.id}, user_id={self.user_id}, name={self.name})>"
