# filepath: tests/backend/test_auth.py
# Purpose: Unit tests for authentication endpoints

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient
import os
import sys

# Add backend to path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend'))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from database import Base, get_db
from models.user_model import User
from models.project_model import Project
from app import app

# Setup in-memory SQLite database for testing with StaticPool
# StaticPool is required for :memory: to persist across multiple connections
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables once
Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
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
        assert response.json()["success"] is True

    def test_register_user_success(self):
        """Test successful user registration."""
        response = client.post(
            "/auth/register",
            json={
                "email": "test_success@example.com",
                "password": "password123"
            }
        )
        assert response.status_code == 201
        assert response.json()["success"] is True

    def test_register_duplicate_email(self):
        """Test registration fails with duplicate email."""
        email = "duplicate@example.com"
        client.post("/auth/register", json={"email": email, "password": "password123"})
        response = client.post("/auth/register", json={"email": email, "password": "password456"})
        assert response.status_code == 409

    def test_register_invalid_password(self):
        """Test registration fails with invalid password."""
        response = client.post("/auth/register", json={"email": "invalid@example.com", "password": "short"})
        assert response.status_code == 422

    def test_login_success(self):
        """Test successful login."""
        email = "login_success@example.com"
        password = "password123"
        client.post("/auth/register", json={"email": email, "password": password})
        response = client.post("/auth/login", json={"email": email, "password": password})
        assert response.status_code == 200
        assert response.json()["success"] is True

    def test_login_invalid_credentials(self):
        """Test login fails with invalid credentials."""
        email = "wrong_creds@example.com"
        client.post("/auth/register", json={"email": email, "password": "password123"})
        response = client.post("/auth/login", json={"email": email, "password": "wrongpassword"})
        assert response.status_code == 401

    def test_get_current_user(self):
        """Test getting current user profile with valid token."""
        email = "profile_test@example.com"
        register_response = client.post("/auth/register", json={"email": email, "password": "password123"})
        token = register_response.json()["data"]["token"]["access_token"]
        response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        assert response.json()["success"] is True
        assert response.json()["data"]["email"] == email

    def test_get_current_user_no_token(self):
        """Test getting current user fails without token."""
        response = client.get("/auth/me")
        assert response.status_code in [401, 403]
