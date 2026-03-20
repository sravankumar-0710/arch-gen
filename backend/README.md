# ArchGen AI — Backend Setup Guide

## Overview

This is the FastAPI Python backend for ArchGen AI. It handles:
- User authentication (register, login, JWT tokens)
- Project management (CRUD operations)
- Layout generation (orchestration layer)

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- PostgreSQL (optional, for production)

## Development Setup

### 1. Create Virtual Environment

```bash
cd backend
python3 -m venv venv
```

Activate the virtual environment:
- **Linux/macOS:** `source venv/bin/activate`
- **Windows:** `venv\Scripts\activate`

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Copy `.env.example` to `.env` and update values:

```bash
cp ../.env.example ../.env
```

Edit `../.env`:
```
DATABASE_URL=sqlite:///archgen_dev.db
SECRET_KEY=your-dev-secret-key
DEBUG=true
```

### 4. Initialize Database

```bash
python3 -c "from database import init_db; init_db()"
```

Or run migrations manually:
```bash
sqlite3 archgen_dev.db < ../database/migrations/001_create_users.sql
sqlite3 archgen_dev.db < ../database/migrations/002_create_projects.sql
```

### 5. Run Development Server

```bash
python3 -m uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- **Interactive API Docs:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

## Project Structure

```
backend/
├── app.py                    # FastAPI app entry point
├── config.py                 # Configuration from env
├── database.py               # SQLAlchemy setup
├── schemas.py                # Pydantic models (request/response)
├── models/
│   ├── user_model.py         # User database model
│   └── project_model.py      # Project database model
├── routes/
│   ├── auth_routes.py        # Authentication endpoints
│   ├── project_routes.py     # Project CRUD endpoints
│   └── generator_routes.py   # Layout generation endpoint
├── services/
│   ├── auth_service.py       # Auth business logic
│   └── project_service.py    # Project business logic
├── middleware/
│   └── auth_middleware.py    # JWT token validation
├── utils/
│   ├── security.py           # Password hashing, JWT creation
│   └── response_helper.py    # Response formatting
└── requirements.txt          # Python dependencies
```

## Key Endpoints

### Authentication

```
POST /auth/register
POST /auth/login
GET  /auth/me (requires token)
```

### Projects

```
POST   /projects                 # Create project
GET    /projects                 # List user's projects
GET    /projects/{id}            # Get single project
PUT    /projects/{id}            # Update project
DELETE /projects/{id}            # Delete project
```

### Layout Generation

```
POST /generate                   # Generate layout (TODO: Phase 5)
```

## Testing

Run backend tests:

```bash
pytest tests/backend/
```

## Production Checklist

- [ ] Change `SECRET_KEY` in `.env`
- [ ] Set `DEBUG=false`
- [ ] Set `DATABASE_URL` to PostgreSQL connection string
- [ ] Update CORS allowed origins
- [ ] Deploy to a server (Render, Railway, AWS, etc.)

## Debugging

Enable verbose logging:

```python
# In app.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Future Phases

- **Phase 5:** Layout generation engine with AI/rule-based placement
- **Phase 8:** 3D model export endpoint
- **Phase 9+:** Advanced features (cost estimation, structural analysis, etc.)
