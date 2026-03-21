# filepath: backend/controllers/auth_controller.py
# Purpose: Auth controller — thin layer between route handlers and AuthService.
# Routes call controllers. Controllers call services. No business logic here.

from sqlalchemy.orm import Session
from schemas import UserRegisterRequest, UserLoginRequest
from services.auth_service import AuthService


class AuthController:

    @staticmethod
    def register(db: Session, user_data: UserRegisterRequest) -> dict:
        """
        Handle user registration request.

        Args:
            db: Database session
            user_data: Validated registration request body

        Returns:
            Dict with user and token data from AuthService
        """
        return AuthService.register_user(db, user_data)

    @staticmethod
    def login(db: Session, user_data: UserLoginRequest) -> dict:
        """
        Handle user login request.

        Args:
            db: Database session
            user_data: Validated login request body

        Returns:
            Dict with user and token data from AuthService
        """
        return AuthService.login_user(db, user_data)

    @staticmethod
    def get_me(db: Session, user_id: int) -> dict:
        """
        Handle get current user request.

        Args:
            db: Database session
            user_id: Authenticated user ID from JWT

        Returns:
            UserResponse Pydantic model
        """
        return AuthService.get_user(db, user_id)