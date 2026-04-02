from typing import Dict, List
from sqlalchemy.orm import Session
from schemas import ProjectCreateRequest, ProjectUpdateRequest
from services.project_service import ProjectService

class ProjectController:
    @staticmethod
    def create(db: Session, user_id: int, project_data: ProjectCreateRequest) -> Dict:
        #...
        return ProjectService.create_project(db, user_id, project_data)

    @staticmethod
    def get_all(db: Session, user_id: int) -> List:
        #...
        return ProjectService.get_projects(db, user_id)

    @staticmethod
    def get_one(db: Session, user_id: int, project_id: int) -> Dict:
        #...
        return ProjectService.get_project(db, user_id, project_id)

    @staticmethod
    def update(db: Session, user_id: int, project_id: int, project_data: ProjectUpdateRequest) -> Dict:
        #...
        return ProjectService.update_project(db, user_id, project_id, project_data)

    @staticmethod
    def delete(db: Session, user_id: int, project_id: int) -> Dict:
        #...
        return ProjectService.delete_project(db, user_id, project_id)
