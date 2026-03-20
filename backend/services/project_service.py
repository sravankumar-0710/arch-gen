# filepath: backend/services/project_service.py
# Purpose: Project management business logic - CRUD operations

from sqlalchemy.orm import Session
from models.project_model import Project
from schemas import ProjectCreateRequest, ProjectUpdateRequest, ProjectResponse
from fastapi import HTTPException, status


class ProjectService:
    """Service layer for project management."""

    @staticmethod
    def create_project(db: Session, user_id: int, project_data: ProjectCreateRequest) -> dict:
        """
        Create a new project for a user.

        Args:
            db: Database session
            user_id: Owner user ID
            project_data: Project creation request

        Returns:
            ProjectResponse object
        """
        new_project = Project(
            user_id=user_id,
            name=project_data.name,
            description=project_data.description
        )

        db.add(new_project)
        db.commit()
        db.refresh(new_project)

        return ProjectResponse.model_validate(new_project)

    @staticmethod
    def get_project(db: Session, user_id: int, project_id: int) -> dict:
        """
        Get a single project (verify ownership).

        Args:
            db: Database session
            user_id: Current user ID
            project_id: Project to fetch

        Returns:
            ProjectResponse object

        Raises:
            HTTPException: If project not found or not owned by user
        """
        project = db.query(Project).filter(
            Project.id == project_id,
            Project.user_id == user_id
        ).first()

        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )

        return ProjectResponse.model_validate(project)

    @staticmethod
    def list_projects(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> list:
        """
        List all projects for a user.

        Args:
            db: Database session
            user_id: User ID
            skip: Pagination offset
            limit: Pagination limit

        Returns:
            List of ProjectResponse objects
        """
        projects = db.query(Project).filter(
            Project.user_id == user_id
        ).offset(skip).limit(limit).all()

        return [ProjectResponse.model_validate(p) for p in projects]

    @staticmethod
    def update_project(db: Session, user_id: int, project_id: int, project_data: ProjectUpdateRequest) -> dict:
        """
        Update a project (verify ownership).

        Args:
            db: Database session
            user_id: Current user ID
            project_id: Project to update
            project_data: Update request

        Returns:
            Updated ProjectResponse object

        Raises:
            HTTPException: If project not found or not owned by user
        """
        project = db.query(Project).filter(
            Project.id == project_id,
            Project.user_id == user_id
        ).first()

        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )

        # Update fields if provided
        if project_data.name is not None:
            project.name = project_data.name
        if project_data.description is not None:
            project.description = project_data.description
        if project_data.land_data is not None:
            project.land_data = project_data.land_data
        if project_data.requirements is not None:
            project.requirements = project_data.requirements
        if project_data.layout is not None:
            project.layout = project_data.layout

        db.commit()
        db.refresh(project)

        return ProjectResponse.model_validate(project)

    @staticmethod
    def delete_project(db: Session, user_id: int, project_id: int) -> None:
        """
        Delete a project (verify ownership).

        Args:
            db: Database session
            user_id: Current user ID
            project_id: Project to delete

        Raises:
            HTTPException: If project not found or not owned by user
        """
        project = db.query(Project).filter(
            Project.id == project_id,
            Project.user_id == user_id
        ).first()

        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )

        db.delete(project)
        db.commit()
