# filepath: backend/routes/auth_routes.py
# Purpose: Authentication API endpoints — register, login, get current user.
# Routes are thin: parse input, call controller, return response. No logic here.

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from schemas import UserRegisterRequest, UserLoginRequest
from controllers.auth_controller import AuthController
from middleware.auth_middleware import get_current_user
from database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegisterRequest, db: Session = Depends(get_db)):
    """Register a new user account. Returns access token on success."""
    result = AuthController.register(db, user_data)
    return {
        "success": True,
        "data": result,
        "message": "User registered successfully"
    }


@router.post("/login", status_code=status.HTTP_200_OK)
def login(user_data: UserLoginRequest, db: Session = Depends(get_db)):
    """Authenticate user with email and password. Returns access token on success."""
    result = AuthController.login(db, user_data)
    return {
        "success": True,
        "data": result,
        "message": "Login successful"
    }


@router.get("/me", status_code=status.HTTP_200_OK)
def get_me(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get current authenticated user profile. Requires valid JWT token."""
    user = AuthController.get_me(db, current_user["user_id"])
    return {
        "success": True,
        "data": user,
        "message": "User profile retrieved"
    }