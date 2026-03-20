# filepath: backend/routes/project_routes.py
# Purpose: Project management API endpoints - CRUD operations

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from schemas import ProjectCreateRequest, ProjectUpdateRequest
from services.project_service import ProjectService
from middleware.auth_middleware import get_current_user
from database import get_db

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("", status_code=status.HTTP_201_CREATED)
def create_project(
    project_data: ProjectCreateRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new project for the authenticated user.
    """
    result = ProjectService.create_project(db, current_user["user_id"], project_data)
    return {
        "success": True,
        "data": result,
        "message": "Project created successfully"
    }


@router.get("", status_code=status.HTTP_200_OK)
def list_projects(
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all projects for the authenticated user.
    """
    projects = ProjectService.list_projects(db, current_user["user_id"], skip, limit)
    return {
        "success": True,
        "data": projects,
        "message": f"Retrieved {len(projects)} projects"
    }


@router.get("/{project_id}", status_code=status.HTTP_200_OK)
def get_project(
    project_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific project by ID.
    """
    project = ProjectService.get_project(db, current_user["user_id"], project_id)
    return {
        "success": True,
        "data": project,
        "message": "Project retrieved successfully"
    }


@router.put("/{project_id}", status_code=status.HTTP_200_OK)
def update_project(
    project_id: int,
    project_data: ProjectUpdateRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a project (land data, requirements, layout, etc).
    """
    project = ProjectService.update_project(db, current_user["user_id"], project_id, project_data)
    return {
        "success": True,
        "data": project,
        "message": "Project updated successfully"
    }


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a project permanently.
    """
    ProjectService.delete_project(db, current_user["user_id"], project_id)
    return {
        "success": True,
        "data": None,
        "message": "Project deleted successfully"
    }
