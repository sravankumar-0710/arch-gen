# 🏗️ ArchGen AI

> AI-powered architectural floor plan generator for custom land shapes.

## What It Does

ArchGen AI generates real-world-usable 2D floor plans and basic 3D models based on:
- Custom polygon land shapes
- Room requirements (basic 2BHK or advanced per-room constraints)
- Orientation (road position, North direction, Vastu compliance)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Desktop Shell | Electron |
| State | Zustand |
| 2D Canvas | Konva.js + react-konva |
| 3D Viewer | React Three Fiber + drei |
| Styling | Tailwind CSS |
| Backend | FastAPI (Python) |
| Database | SQLite (dev) / PostgreSQL (prod) |
| ORM | SQLAlchemy |
| Geometry | Shapely |
| Auth | python-jose + passlib |

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url> archgen-ai
cd archgen-ai
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Set up Python backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Set up frontend

```bash
cd src
npm install
```

### 5. Run in development

```bash
# Terminal 1 — Frontend
cd src && npm run dev

# Terminal 2 — Backend
cd backend && uvicorn app:app --reload --port 8000

# Terminal 3 — Electron (after frontend is running)
npm run dev:electron
```

## Project Structure

See `docs/structure.md` for the full file structure.

## Development Plan

See `docs/plan.md` for the phase-by-phase development roadmap.

## Disclaimer

This software provides conceptual architectural plans and should not replace professional consultation. Generated layouts are not certified for construction.
