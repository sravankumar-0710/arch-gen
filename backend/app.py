# filepath: backend/app.py
# Purpose: FastAPI application factory and route registration

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from database import init_db
from routes.auth_routes import router as auth_router
from routes.project_routes import router as project_router
from routes.generator_routes import router as generator_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize resources on startup, clean up on shutdown."""
    init_db()
    yield


# Initialize FastAPI app
app = FastAPI(
    title="ArchGen AI",
    description="AI-powered architectural floor plan generator",
    version="1.0.0-mvp",
    lifespan=lifespan,
)

# Add CORS middleware to allow frontend requests
# NOTE: allow_origins=["*"] cannot be used with allow_credentials=True — browsers block it.
# Use explicit origins instead. Add any new dev ports here if Vite picks a different one.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5182",
        "http://localhost:5183",
        "http://localhost:5184",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://127.0.0.1:5182",
        "http://127.0.0.1:5183",
        "http://127.0.0.1:5184",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health", tags=["health"])
def health_check():
    """Health check endpoint — confirms API is reachable."""
    return {
        "success": True,
        "data": {"environment": "development" if settings.debug else "production"},
        "message": "API is healthy"
    }


# Root endpoint
@app.get("/", tags=["root"])
def root():
    """Root API endpoint."""
    return {
        "success": True,
        "data": {"version": "1.0.0-mvp", "docs": "/docs"},
        "message": "ArchGen AI API"
    }


# Register route modules
app.include_router(auth_router)
app.include_router(project_router)
app.include_router(generator_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
    )