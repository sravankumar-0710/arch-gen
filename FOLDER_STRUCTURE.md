# ArchGen AI - Project Folder Structure

**Updated**: 2026-03-20
**Status**: Organized with docs/ and tests/ folders

---

## Folder Organization

```
archgen-ai/
│
├── docs/                          # DOCUMENTATION ARTIFACTS
│   ├── README.md                 # Documentation index
│   ├── PROJECT_STATUS.md         # Overall project status
│   ├── PHASE_5_COMPLETE.md       # Phase 5 completion details
│   ├── PHASE_5_STATUS.md         # Previous phase 5 status
│   ├── TESTING_GUIDE.md          # How to run tests
│   ├── VERIFICATION_REPORT.md    # Test verification
│   ├── PRD.md                    # Product requirements
│   ├── architecture.md           # System architecture
│   ├── ai_rules.md              # AI development rules
│   └── (other phase status docs)
│
├── tests/                         # TEST SUITES
│   ├── FULL_INTEGRATION_TEST.py  # All 5 phases integrated test
│   ├── PHASE_5_TEST.py           # Phase 5 specific test
│   └── backend/                  # Backend unit tests (future)
│
├── backend/                       # PYTHON FASTAPI BACKEND
│   ├── app.py                    # FastAPI application
│   ├── config.py                 # Configuration
│   ├── database.py               # Database setup
│   ├── schemas.py                # Pydantic models
│   ├── routes/                   # API route handlers
│   │   ├── auth_routes.py
│   │   ├── project_routes.py
│   │   └── generator_routes.py
│   ├── services/                 # Business logic
│   │   ├── auth_service.py
│   │   ├── project_service.py
│   │   └── layout_service.py
│   ├── models/                   # SQLAlchemy ORM models
│   │   ├── user_model.py
│   │   └── project_model.py
│   ├── middleware/               # Auth middleware
│   │   └── auth_middleware.py
│   ├── utils/                    # Utilities
│   │   ├── geometry_utils.py
│   │   ├── vastu_scorer.py
│   │   ├── security.py
│   │   └── response_helper.py
│   └── venv/                     # Virtual environment
│
├── src/                          # REACT FRONTEND
│   ├── main.jsx                  # React entry point
│   ├── index.html                # HTML template
│   ├── pages/                    # Page components
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── DashboardPage.jsx
│   │   └── EditorPage.jsx
│   ├── components/               # Reusable components
│   ├── hooks/                    # Custom hooks
│   │   ├── useAuth.js
│   │   └── useProject.js
│   ├── stores/                   # Zustand state stores
│   │   ├── authStore.js
│   │   └── projectStore.js
│   ├── services/                 # API services
│   │   └── authService.js
│   ├── styles/                   # Global styles
│   │   └── global.css
│   ├── vite.config.js            # Vite config
│   ├── tailwind.config.js        # Tailwind config
│   ├── postcss.config.js         # PostCSS config
│   ├── package.json              # Dependencies
│   └── node_modules/             # Installed packages
│
├── database/                     # SQLITE DATABASE
│   └── archgen_dev.db            # Development database
│
├── debug/                        # DEBUG & LEGACY TEST FILES
│   ├── PHASE_5_TEST.py          # (Original - see tests/PHASE_5_TEST.py)
│   ├── DEBUG_DIRECT.py
│   ├── DEBUG_HTTP.py
│   ├── INTEGRATION_TEST.py      # (Legacy - see tests/FULL_INTEGRATION_TEST.py)
│   └── (other debug/test files)
│
├── run_backend.py                # Backend startup script
├── FOLDER_STRUCTURE.md          # This file
└── README.md                     # (If exists) Project overview

```

---

## Key Folders Explained

### docs/
**Purpose**: All project documentation and status reports
**Contains**:
- Phase completion reports
- Integration test results
- Architecture documentation
- Testing guides
- Project requirements

**Usage**: Reference these for project status and information

### tests/
**Purpose**: All automated test files
**Contains**:
- FULL_INTEGRATION_TEST.py - Tests all 5 phases
- PHASE_5_TEST.py - Tests layout generation
- backend/ - Unit tests (future expansion)

**Usage**: Run tests regularly to verify system health

### backend/
**Purpose**: Python FastAPI backend server
**Contains**:
- HTTP API endpoints
- Database models and queries
- Business logic services
- Authentication middleware
- Geometry and Vastu utilities

**Usage**: Power the application; run with `python -B run_backend.py`

### src/
**Purpose**: React frontend web application
**Contains**:
- React pages and components
- State management (Zustand)
- API service calls
- Styling (Tailwind CSS)
- Build configuration (Vite)

**Usage**: Web interface; run with `npm run dev`

### database/
**Purpose**: SQLite database storage
**Contains**:
- archgen_dev.db - Development database file

**Usage**: Persists user data, projects, and layouts

### debug/
**Purpose**: Legacy debug and test files
**Contains**:
- Old test versions
- Debug scripts
- Previous test iterations

**Usage**: Historical reference only

---

## File Organization Rules

### Documentation Files
- Location: `docs/` folder
- Format: Markdown (.md)
- Examples:
  - PROJECT_STATUS.md
  - PHASE_5_COMPLETE.md
  - TESTING_GUIDE.md

### Test Files
- Location: `tests/` folder
- Format: Python (.py)
- Examples:
  - FULL_INTEGRATION_TEST.py
  - PHASE_5_TEST.py

### Source Code
- Location: `backend/` or `src/` folder
- Backend: Python + FastAPI
- Frontend: React + JavaScript

### Configuration Files
- Location: Project root or respective folders
- Examples:
  - run_backend.py (root)
  - vite.config.js (src/)
  - tailwind.config.js (src/)
  - /backend/app.py

---

## Best Practices

### When Adding New Tests
1. Create in `tests/` folder
2. Name it descriptively: `PHASE_X_TEST.py` or `TEST_<feature>.py`
3. Update this document
4. Add to TESTING_GUIDE.md

### When Writing Documentation
1. Save in `docs/` folder
2. Use Markdown format
3. Link from docs/README.md
4. Keep PROJECT_STATUS.md current

### When Creating Reports
1. Save in `docs/` folder
2. Include date and status
3. Cross-reference related docs
4. Add to documentation index

### Legacy Files
1. Keep debug files for reference
2. Don't create new tests/reports outside docs/ and tests/
3. Clean up periodically

---

## Quick Navigation

| Task | Location |
|------|----------|
| View project status | docs/PROJECT_STATUS.md |
| Understand Phase 5 fix | docs/PHASE_5_COMPLETE.md |
| Learn how to test | docs/TESTING_GUIDE.md |
| Run integration tests | tests/FULL_INTEGRATION_TEST.py |
| Test layout generation | tests/PHASE_5_TEST.py |
| Start backend | python -B run_backend.py |
| Start frontend | cd src && npm run dev |
| Database | database/archgen_dev.db |

---

## Migration Summary (2026-03-20)

**Changes Made**:
- Created `docs/` folder for all documentation
- Created `tests/` folder for all test files
- Moved FULL_INTEGRATION_TEST.py to tests/
- Copied PHASE_5_TEST.py to tests/
- Created docs/README.md (documentation index)
- Created docs/PROJECT_STATUS.md (overall status)
- Created docs/PHASE_5_COMPLETE.md (phase 5 details)
- Created docs/TESTING_GUIDE.md (testing guide)

**Benefits**:
- ✓ Cleaner project root
- ✓ Organized documentation
- ✓ Centralized test files
- ✓ Easier navigation
- ✓ Professional structure

---

**Status**: ✓ Organization Complete
**Last Updated**: 2026-03-20
