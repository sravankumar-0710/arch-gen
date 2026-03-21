# filepath: backend/schemas.py
# Purpose: Pydantic models for API request/response validation

from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


# ─────────────────────────────────────────────
# Auth Schemas
# ─────────────────────────────────────────────

class UserRegisterRequest(BaseModel):
    """Request body for user registration."""
    email: EmailStr
    # min_length=8 matches frontend validators.js validatePassword rule
    password: str = Field(..., min_length=8)


class UserLoginRequest(BaseModel):
    """Request body for user login."""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Response body for user info."""
    id: int
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Response body for authentication token."""
    access_token: str
    token_type: str = "bearer"


# ─────────────────────────────────────────────
# Project Schemas
# ─────────────────────────────────────────────

class ProjectCreateRequest(BaseModel):
    """Request body for creating a new project."""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)


class ProjectUpdateRequest(BaseModel):
    """Request body for updating a project."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    land_data: Optional[dict] = None
    requirements: Optional[dict] = None
    layout: Optional[dict] = None


class ProjectResponse(BaseModel):
    """Response body for project info."""
    id: int
    user_id: int
    name: str
    description: Optional[str]
    land_data: Optional[dict]
    requirements: Optional[dict]
    layout: Optional[dict]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────
# Generator Schemas
# ─────────────────────────────────────────────

class GenerateLayoutRequest(BaseModel):
    """Request body for layout generation."""
    land_data: dict       # { polygonPoints, unit, roadSide, northAngle, dimensions }
    requirements: dict    # { mode, rooms, vastuEnabled, floors }


class LayoutOption(BaseModel):
    """A single generated layout option."""
    id: int
    rooms: list[dict]
    walls: list[dict]
    score: float


class GenerateLayoutResponse(BaseModel):
    """Response body for layout generation."""
    success: bool
    layouts: Optional[list[LayoutOption]] = None
    message: str
    warnings: Optional[list[str]] = None


# ─────────────────────────────────────────────
# Generic Response Envelope
# ─────────────────────────────────────────────

class ApiResponse(BaseModel):
    """Standard response envelope for all API endpoints."""
    success: bool
    data: Optional[dict] = None
    message: str
    errors: Optional[list[str]] = None