# filepath: tests/backend/test_auth.py
# Purpose: Unit tests for authentication endpoints

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from datetime import timedelta

# These are assumed to be importable from backend root
import sys
sys.path.insert(0, '../../backend')

from app import app
from database import Base, get_db
from schemas import UserRegisterRequest, UserLoginRequest
from utils.security import create_access_token

# Setup in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


class TestAuthRoutes:
    """Test suite for authentication endpoints."""

    def test_health_check(self):
        """Test health endpoint is accessible."""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"

    def test_register_user_success(self):
        """Test successful user registration."""
        response = client.post(
            "/auth/register",
            json={
                "email": "test@example.com",
                "password": "password123"
            }
        )
        assert response.status_code == 201
        assert response.json()["success"] is True
        assert "data" in response.json()
        assert "user" in response.json()["data"]
        assert "token" in response.json()["data"]

    def test_register_duplicate_email(self):
        """Test registration fails with duplicate email."""
        # Register first user
        client.post(
            "/auth/register",
            json={
                "email": "duplicate@example.com",
                "password": "password123"
            }
        )

        # Try to register same email again
        response = client.post(
            "/auth/register",
            json={
                "email": "duplicate@example.com",
                "password": "password456"
            }
        )
        assert response.status_code == 409
        assert response.json()["success"] is False

    def test_register_invalid_password(self):
        """Test registration fails with invalid password."""
        response = client.post(
            "/auth/register",
            json={
                "email": "test2@example.com",
                "password": "short"
            }
        )
        assert response.status_code == 422  # Validation error

    def test_login_success(self):
        """Test successful login."""
        # Register first
        client.post(
            "/auth/register",
            json={
                "email": "login@example.com",
                "password": "password123"
            }
        )

        # Login
        response = client.post(
            "/auth/login",
            json={
                "email": "login@example.com",
                "password": "password123"
            }
        )
        assert response.status_code == 200
        assert response.json()["success"] is True
        assert "token" in response.json()["data"]

    def test_login_invalid_credentials(self):
        """Test login fails with invalid credentials."""
        # Register first
        client.post(
            "/auth/register",
            json={
                "email": "user@example.com",
                "password": "password123"
            }
        )

        # Try to login with wrong password
        response = client.post(
            "/auth/login",
            json={
                "email": "user@example.com",
                "password": "wrongpassword"
            }
        )
        assert response.status_code == 401
        assert response.json()["success"] is False

    def test_get_current_user(self):
        """Test getting current user profile with valid token."""
        # Register and login
        register_response = client.post(
            "/auth/register",
            json={
                "email": "profile@example.com",
                "password": "password123"
            }
        )
        token = register_response.json()["data"]["token"]["access_token"]

        # Get current user
        response = client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        assert response.json()["success"] is True
        assert response.json()["data"]["email"] == "profile@example.com"

    def test_get_current_user_no_token(self):
        """Test getting current user fails without token."""
        response = client.get("/auth/me")
        assert response.status_code == 403  # Forbidden


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
