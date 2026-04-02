# filepath: backend/services/project_service.py
# Purpose: Project management business logic - CRUD operations

from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from models.project_model import Project
from schemas import ProjectCreateRequest, ProjectUpdateRequest
from fastapi import HTTPException, status


class ProjectService:
    @staticmethod
    def create_project(db: Session, user_id: int, project_data: ProjectCreateRequest) -> Project:
        """Create a new project for a user."""
        db_project = Project(
            user_id=user_id,
            name=project_data.name,
            description=project_data.description,
            land_data=project_data.land_data,
            requirements=project_data.requirements,
            layout=project_data.layout
        )
        db.add(db_project)
        db.commit()
        db.refresh(db_project)
        return db_project

    @staticmethod
    def list_projects(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Project]:
        """List all projects belonging to a user."""
        return db.query(Project).filter(Project.user_id == user_id).offset(skip).limit(limit).all()

    @staticmethod
    def get_project(db: Session, user_id: int, project_id: int) -> Project:
        """Get a specific project by ID, ensuring it belongs to the user."""
        project = db.query(Project).filter(Project.id == project_id, Project.user_id == user_id).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        return project

    @staticmethod
    def update_project(db: Session, user_id: int, project_id: int, project_data: ProjectUpdateRequest) -> Project:
        """Update an existing project."""
        db_project = ProjectService.get_project(db, user_id, project_id)

        # Update fields if provided
        if project_data.name is not None:
            db_project.name = project_data.name
        if project_data.description is not None:
            db_project.description = project_data.description
        if project_data.land_data is not None:
            db_project.land_data = project_data.land_data
        if project_data.requirements is not None:
            db_project.requirements = project_data.requirements
        if project_data.layout is not None:
            db_project.layout = project_data.layout

        db.commit()
        db.refresh(db_project)
        return db_project

    @staticmethod
    def delete_project(db: Session, user_id: int, project_id: int) -> bool:
        """Delete a project."""
        db_project = ProjectService.get_project(db, user_id, project_id)
        db.delete(db_project)
        db.commit()
        return True
