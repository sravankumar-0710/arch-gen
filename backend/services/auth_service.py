# filepath: backend/services/auth_service.py
# Purpose: Authentication business logic - user registration, login, validation

from sqlalchemy.orm import Session
from models.user_model import User
from schemas import UserRegisterRequest, UserLoginRequest, UserResponse, TokenResponse
from utils.security import hash_password, verify_password, create_access_token
from fastapi import HTTPException, status


class AuthService:
    """Service layer for user authentication."""

    @staticmethod
    def register_user(db: Session, user_data: UserRegisterRequest) -> dict:
        """
        Register a new user.

        Args:
            db: Database session
            user_data: Registration request body

        Returns:
            Dictionary with user info and access token

        Raises:
            HTTPException: If email already exists
        """
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )

        # Create new user
        hashed_password = hash_password(user_data.password)
        new_user = User(email=user_data.email, password_hash=hashed_password)

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Generate token
        access_token = create_access_token(data={"sub": str(new_user.id)})

        return {
            "user": UserResponse.model_validate(new_user),
            "token": TokenResponse(access_token=access_token)
        }

    @staticmethod
    def login_user(db: Session, user_data: UserLoginRequest) -> dict:
        """
        Authenticate user credentials.

        Args:
            db: Database session
            user_data: Login request body

        Returns:
            Dictionary with user info and access token

        Raises:
            HTTPException: If email not found or password incorrect
        """
        user = db.query(User).filter(User.email == user_data.email).first()

        if not user or not verify_password(user_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Generate token
        access_token = create_access_token(data={"sub": str(user.id)})

        return {
            "user": UserResponse.model_validate(user),
            "token": TokenResponse(access_token=access_token)
        }

    @staticmethod
    def get_user(db: Session, user_id: int) -> dict:
        """
        Get user by ID.

        Args:
            db: Database session
            user_id: User ID to fetch

        Returns:
            User response object

        Raises:
            HTTPException: If user not found
        """
        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return UserResponse.model_validate(user)
