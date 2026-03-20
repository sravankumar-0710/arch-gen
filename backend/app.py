# filepath: backend/app.py
# Purpose: FastAPI application factory and route registration

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
from config import settings
from database import init_db
from routes.auth_routes import router as auth_router
from routes.project_routes import router as project_router
from routes.generator_routes import router as generator_router


# Initialize FastAPI app
app = FastAPI(
    title="ArchGen AI",
    description="AI-powered architectural floor plan generator",
    version="1.0.0-mvp"
)

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Restrict to specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
def startup():
    """Initialize database schema on app startup."""
    init_db()


# Health check endpoint
@app.get("/health", tags=["health"])
def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "environment": "development" if settings.debug else "production"
    }


# Register route modules
app.include_router(auth_router)
app.include_router(project_router)
app.include_router(generator_router)


# Root endpoint
@app.get("/", tags=["root"])
def root():
    """Root API endpoint."""
    return {
        "message": "ArchGen AI API",
        "version": "1.0.0-mvp",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
