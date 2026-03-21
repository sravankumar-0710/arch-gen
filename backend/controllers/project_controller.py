# filepath: backend/controllers/project_controller.py
# Purpose: Project controller — thin layer between route handlers and ProjectService.
# Routes call controllers. Controllers call services. No business logic here.

from sqlalchemy.orm import Session
from schemas import ProjectCreateRequest, ProjectUpdateRequest


class ProjectController:

    @staticmethod
    def create(db: Session, user_id: int, project_data: ProjectCreateRequest) -> dict:
        """
        Handle project creation request.

        Args:
            db: Database session
            user_id: Authenticated user ID
            project_data: Validated project creation body

        Returns:
            ProjectResponse Pydantic model
        """
        from services.project_service import ProjectService
        return ProjectService.create_project(db, user_id, project_data)

    @staticmethod
    def get_all(db: Session, user_id: int) -> list:
        """
        Handle get all projects for a user.

        Args:
            db: Database session
            user_id: Authenticated user ID

        Returns:
            List of ProjectResponse Pydantic models
        """
        from services.project_service import ProjectService
        return ProjectService.get_projects(db, user_id)

    @staticmethod
    def get_one(db: Session, user_id: int, project_id: int) -> dict:
        """
        Handle get single project request.

        Args:
            db: Database session
            user_id: Authenticated user ID
            project_id: Project ID to fetch

        Returns:
            ProjectResponse Pydantic model
        """
        from services.project_service import ProjectService
        return ProjectService.get_project(db, user_id, project_id)

    @staticmethod
    def update(db: Session, user_id: int, project_id: int, project_data: ProjectUpdateRequest) -> dict:
        """
        Handle project update request.

        Args:
            db: Database session
            user_id: Authenticated user ID
            project_id: Project ID to update
            project_data: Validated update body

        Returns:
            Updated ProjectResponse Pydantic model
        """
        from services.project_service import ProjectService
        return ProjectService.update_project(db, user_id, project_id, project_data)

    @staticmethod
    def delete(db: Session, user_id: int, project_id: int) -> dict:
        """
        Handle project deletion request.

        Args:
            db: Database session
            user_id: Authenticated user ID
            project_id: Project ID to delete

        Returns:
            Success message dict
        """
        from services.project_service import ProjectService
        return ProjectService.delete_project(db, user_id, project_id)