# filepath: backend/controllers/generator_controller.py
# Purpose: Generator controller — thin layer between route handlers and LayoutService.
# Routes call controllers. Controllers call services. No business logic here.

from sqlalchemy.orm import Session
from schemas import GenerateLayoutRequest


class GeneratorController:

    @staticmethod
    def generate(db: Session, user_id: int, payload: GenerateLayoutRequest) -> dict:
        """
        Handle layout generation request.

        Args:
            db: Database session
            user_id: Authenticated user ID
            payload: Validated generation request body (land_data + requirements)

        Returns:
            GenerateLayoutResponse with layouts list and warnings
        """
        from services.layout_service import LayoutService
        return LayoutService.generate_layout(db, user_id, payload)