# 🗺️ ArchGen AI — Complete Development Plan

> A step-by-step execution roadmap from zero to working product.
> Follow phases in order. Each phase builds on the previous.

---

## 📋 Overview

| Phase | Name | Est. Time |
|---|---|---|
| 1 | Project Setup & Scaffolding | 3–5 days |
| 2 | Authentication System | 3–4 days |
| 3 | Land Input & Canvas | 5–7 days |
| 4 | Requirements Input System | 3–4 days |
| 5 | Layout Generation Engine (Backend) | 10–15 days |
| 6 | 2D Floor Plan Renderer | 5–7 days |cd c:\Users\User\Desktop\archgen-ai

| 7 | Editing System | 6–8 days |
| 8 | 3D Model Viewer | 5–7 days |
| 9 | Project Save / Load | 3–4 days |
| 10 | Integration & End-to-End Flow | 4–5 days |  
| 11 | Testing & Bug Fixes | 5–7 days |
| 12 | Polish & MVP Release | 3–5 days |

**Total Estimated Time: ~55–78 days (solo developer)**

---

## ✅ Pre-Work: Decisions to Make Before Coding

Before writing a single line, lock in these decisions:

- [ ] **Tech stack confirmed:**
  - Frontend: React + Vite
  - Desktop: Electron
  - Backend: FastAPI (Python)
  - Database: SQLite (dev) → PostgreSQL (prod)
  - 2D Canvas: Konva.js
  - 3D Viewer: React Three Fiber (Three.js)
  - State: Zustand
  - AI Layer: Rule-based first, LLM/ML later

- [ ] **Vastu rules documented** (list of direction constraints per room type)
- [ ] **Minimum room size table defined** (bedroom, kitchen, bathroom, etc.)
- [ ] **India building code basics noted** (setbacks, FAR, coverage %)
- [ ] **Design system color palette & fonts chosen**

---

## Phase 1 — Project Setup & Scaffolding

**Goal:** Working skeleton app that runs on desktop with frontend + backend connected.

### Steps

1. **Initialize monorepo structure**
   - Create root `archgen-ai/` folder
   - Set up `src/` (React), `electron/`, `backend/` directories
   - Add `.gitignore`, `README.md`, `.env.example`

2. **Set up React + Vite frontend**
   - `npm create vite@latest src -- --template react`
   - Install: `react-router-dom`, `zustand`, `axios`
   - Set up folder structure: `pages/`, `components/`, `hooks/`, `store/`, `services/`, `utils/`
   - Create placeholder pages: Login, Dashboard, Editor

3. **Set up Electron shell**
   - Install `electron`, `electron-builder`
   - Write `electron/main.js` to open a BrowserWindow loading the Vite dev server
   - Write `electron/preload.js` with context bridge
   - Add `npm run electron` script to root `package.json`
   - Test: app opens in desktop window

4. **Set up FastAPI backend**
   - Create `backend/` Python environment (`venv`)
   - Install: `fastapi`, `uvicorn`, `sqlalchemy`, `python-jose`, `passlib`, `shapely`, `numpy`, `pillow`
   - Write `backend/app.py` with a `/health` GET route
   - Test: `curl http://localhost:8000/health` returns `{ "status": "ok" }`

5. **Connect frontend to backend**
   - Create `src/services/api.js` with Axios base URL pointing to FastAPI
   - Test API call from React → FastAPI health endpoint

6. **Set up database**
   - Write `database/schema.sql` with `users` and `projects` tables
   - Configure SQLAlchemy in `backend/config.py`
   - Test DB connection on app startup

7. **Set up IPC bridge (Electron ↔ Frontend)**
   - Write `electron/ipc/` handlers for auth, project, generate
   - Expose via `contextBridge` in preload
   - Test a dummy IPC call

**Phase 1 Done When:** Desktop app opens, frontend renders, backend is reachable, DB connects.

---

## Phase 2 — Authentication System

**Goal:** Users can register, log in, and stay logged in across sessions.

### Steps

1. **Backend: User model**
   - Write `backend/models/user_model.py` (id, email, password_hash, created_at)
   - Run migration: `001_create_users.sql`

2. **Backend: Auth routes**
   - `POST /auth/register` — hash password, save user, return JWT
   - `POST /auth/login` — verify password, return JWT
   - `GET /auth/me` — return current user from JWT
   - Write `backend/middleware/auth_middleware.py` to protect routes

3. **Frontend: Auth store**
   - Write `src/store/authStore.js` (user, token, login, logout actions)
   - Persist token to `localStorage`

4. **Frontend: Auth service**
   - Write `src/services/authService.js` (register, login, getMe)

5. **Frontend: Login & Signup pages**
   - Build `LoginForm.jsx` and `SignupForm.jsx` components
   - Connect to auth store
   - Add form validation via `src/utils/validators.js`

6. **Frontend: Protected routes**
   - Wrap Editor and Dashboard in auth guard
   - Redirect unauthenticated users to Login

7. **Test auth flow end to end**
   - Register → Login → Access dashboard → Refresh → Still logged in → Logout

**Phase 2 Done When:** Full auth flow works with JWT, protected routes enforced.

---

## Phase 3 — Land Input & Canvas

**Goal:** User can draw or input a polygon plot, set road position, and set North orientation.

### Steps

1. **Set up Konva.js canvas**
   - Install `konva`, `react-konva`
   - Create `LandCanvas.jsx` with a grid background
   - Render a basic stage + layer

2. **Build PolygonDrawer tool**
   - Click to place polygon points on canvas
   - Click first point again to close polygon
   - Render polygon shape as user draws
   - Show point handles

3. **Rectangle mode**
   - Add option to input Width × Height directly
   - Auto-draw rectangle on canvas from inputs

4. **DimensionInput component**
   - Unit toggle: feet / meters
   - Show live dimensions on canvas edges

5. **RoadPositionPicker**
   - UI to select which edge of the plot is the road-facing side
   - Highlight the selected edge on canvas

6. **OrientationPicker (compass)**
   - Rotatable compass UI
   - User sets which direction is North
   - Store orientation angle in land store

7. **Land store**
   - Write `src/store/landStore.js`
   - Fields: polygonPoints, unit, roadSide, northAngle, dimensions

8. **Input validation**
   - Minimum plot area check
   - Self-intersecting polygon detection (using geometry utils)
   - Show error messages inline

9. **Test canvas interactions**
   - Draw polygon, select road side, set North, see stored values

**Phase 3 Done When:** User can define any polygon plot with orientation — data is cleanly stored.

---

## Phase 4 — Requirements Input System

**Goal:** User can specify room requirements in basic or advanced mode.

### Steps

1. **Basic mode form**
   - Dropdown: number of bedrooms (1–5)
   - Dropdown: number of floors (1–3)
   - Checkbox: attached bathrooms
   - Checkbox: living room, dining room, kitchen (defaults on)

2. **Advanced mode form**
   - Per-room constraint rows (`RoomConstraintRow.jsx`):
     - Room type selector
     - Preferred direction (N/S/E/W/Any)
     - Min size override
     - Special flags (attached bath, balcony, etc.)
   - Add / remove room rows dynamically

3. **Vastu options panel**
   - Toggle: Enable Vastu compliance
   - Show preset Vastu rules (kitchen south, master bedroom SW, etc.)
   - Allow override per room

4. **Requirements store**
   - Write `src/store/requirementsStore.js`
   - Fields: mode, rooms[], vastuEnabled, floors

5. **Validation**
   - Check total rooms fit within plot area estimate
   - Warn on conflicting direction constraints

**Phase 4 Done When:** User can specify a full 2BHK requirement in both basic and advanced mode.

---

## Phase 5 — Layout Generation Engine (Backend)

**Goal:** Given a polygon + requirements, generate multiple valid floor plan layouts.

> This is the most complex phase. Break it into sub-phases.

---

### Phase 5A — Geometry Engine

1. **`polygon_utils.py`**
   - Accept polygon points from frontend
   - Compute bounding box, area, centroid
   - Validate: min area, no self-intersections
   - Decompose complex polygons into rectangles (using Shapely)

2. **`room_placer.py`**
   - Given list of rooms with sizes, place them inside the polygon
   - Start with simple grid-packing approach
   - Respect setbacks (leave margin from plot boundary)

3. **`wall_builder.py`**
   - From placed room rectangles, generate shared wall segments
   - Output: list of wall line segments with thickness

---

### Phase 5B — Rule-Based Layer

4. **`room_size_rules.py`**
   - Define minimum dimensions per room type:
     - Bedroom: 10×10 ft min
     - Kitchen: 8×8 ft min
     - Bathroom: 5×7 ft min
     - Living: 12×12 ft min
   - Validate and reject rooms below minimum

5. **`adjacency_rules.py`**
   - Kitchen should be near dining
   - Master bedroom away from entrance
   - Bathrooms should not face entrance
   - Encode as constraint graph

6. **`door_window_rules.py`**
   - Entrance door on road-facing wall
   - Windows on exterior walls only
   - Minimum 1 window per habitable room

7. **`ventilation_rules.py`**
   - Every room must have at least one exterior wall
   - Flag rooms that are fully interior

8. **`building_code_rules.py`**
   - Minimum setbacks from plot boundary (e.g., 3 ft sides, 5 ft front)
   - Max coverage ratio (e.g., 60% of plot)
   - Validate and flag violations

---

### Phase 5C — Constraint Solver

9. **`vastu_solver.py`**
   - Map room types to preferred directions
   - Score each layout for Vastu compliance
   - If Vastu enabled, filter/rank layouts by score

10. **`orientation_solver.py`**
    - Rotate/align layout based on North direction input
    - Ensure entrance faces road

11. **`conflict_resolver.py`**
    - Detect conflicting constraints (e.g., kitchen must be South but plot has no South exterior wall)
    - Return warnings without blocking generation

---

### Phase 5D — AI Layer (MVP: Heuristic, Future: ML)

12. **`layout_generator.py`** (MVP version)
    - Implement a heuristic-based layout generator:
      - Try N random room arrangements inside polygon
      - Score each using rule violations + Vastu score + adjacency score
      - Return top 3–5 scoring layouts
    - Future: Replace with trained ML model or LLM prompting

13. **`layout_engine.py`** — Orchestrator
    - Accept input: `{ polygon, requirements, orientation, vastu }`
    - Run: validate → place rooms → apply rules → solve constraints → score → return top layouts
    - Return: list of layout objects with room positions, wall segments, scores

---

### Phase 5E — API Route

14. **`generator_routes.py`**
    - `POST /generate` — accepts land + requirements JSON, returns layouts
    - Add auth middleware
    - Add input validation

15. **Test generation end-to-end**
    - Send a sample 30×40 ft plot + 2BHK requirements
    - Verify 3+ valid layouts returned with room coordinates

**Phase 5 Done When:** Backend reliably generates 3–5 valid layouts for a given input in under 10 seconds.

---

## Phase 6 — 2D Floor Plan Renderer

**Goal:** Display the generated layout as a clean 2D architectural floor plan.

### Steps

1. **`FloorPlanCanvas.jsx`**
   - Accept layout data (rooms, walls) as props
   - Render using Konva.js stage
   - Draw walls as thick lines
   - Fill rooms with light colors

2. **`WallRenderer.jsx`**
   - Draw wall segments with correct thickness
   - Handle shared walls (don't double-draw)

3. **`RoomLabel.jsx`**
   - Center room name label inside each room
   - Show room dimensions (e.g., "12 × 10 ft")

4. **`DimensionOverlay.jsx`**
   - Show overall plot dimensions
   - Show individual room dimensions on hover

5. **`LayoutSelector.jsx`**
   - Show thumbnail previews of all generated layouts
   - User clicks to select the active layout
   - Highlight selected layout

6. **`ExportButton.jsx`**
   - Export current floor plan as PNG using Konva's `toDataURL()`
   - Save to local disk via Electron dialog

7. **Backend: `floorplan_renderer.py`**
   - Optional: server-side PNG generation using Pillow
   - Used for high-quality exports

**Phase 6 Done When:** Generated layouts are displayed as clean, labeled 2D floor plans with export.

---

## Phase 7 — Editing System

**Goal:** User can adjust the selected layout — move rooms, resize, undo/redo.

### Steps

1. **`useUndoRedo.js` hook**
   - Implement command pattern: push state to history stack
   - `undo()` pops last state, `redo()` replays

2. **`DragDropRoom.jsx`**
   - Make room rectangles draggable on canvas
   - Snap to grid while dragging
   - On drop: validate new position doesn't violate rules
   - If invalid: snap back with warning

3. **`ResizeHandle.jsx`**
   - Show resize handles on selected room
   - Drag to resize
   - Enforce minimum room size during resize

4. **`WallEditor.jsx`**
   - Click on a wall to select it
   - Drag wall to move it (adjusts adjacent rooms)
   - Walls shared between rooms update both rooms

5. **`EditorToolbar.jsx`**
   - Tool buttons: Select, Move, Resize, Add Room, Delete Room
   - Undo / Redo buttons
   - Validate Layout button (re-runs constraint checks)

6. **`VersionHistoryPanel.jsx`**
   - Show list of saved versions (named snapshots)
   - Click to restore a version

7. **Constraint enforcement during editing**
   - After every edit, re-run rule checks
   - Show inline warnings (e.g., "Kitchen is now below minimum size")
   - Never hard-block edits, only warn

**Phase 7 Done When:** User can freely edit layout with drag/drop, resize, undo/redo, with live validation warnings.

---

## Phase 8 — 3D Model Viewer

**Goal:** Convert the 2D floor plan into a basic 3D model viewable in the app.

### Steps

1. **Set up React Three Fiber**
   - Install `three`, `@react-three/fiber`, `@react-three/drei`
   - Create `ThreeDViewer.jsx` with a canvas, camera, lighting, orbit controls

2. **`FloorMesh.jsx`**
   - Extrude floor polygon from 2D room shapes
   - Apply flat color material per room type

3. **`WallMesh.jsx`**
   - Extrude wall segments vertically (default ceiling height: 10 ft)
   - Apply wall material (light gray)

4. **`RoofMesh.jsx`**
   - Add a simple flat roof over the building footprint
   - Future: sloped/hip roof options

5. **Backend: `model_exporter.py`**
   - Convert layout data to a JSON structure with 3D vertices
   - Optional: export as `.obj` file for external tools

6. **Camera controls**
   - Orbit: rotate around model
   - Zoom in/out
   - Toggle between top-down (plan) view and perspective view

7. **Sync 2D edits → 3D**
   - When user edits 2D layout, 3D model updates live

**Phase 8 Done When:** A navigable 3D model of the floor plan is visible alongside the 2D plan.

---

## Phase 9 — Project Save / Load

**Goal:** Users can save their designs and reload them in future sessions.

### Steps

1. **Backend: Project model**
   - Write `backend/models/project_model.py`
   - Fields: id, user_id, name, land_data (JSON), requirements (JSON), layout (JSON), created_at, updated_at
   - Run migration: `002_create_projects.sql`

2. **Backend: Project routes**
   - `POST /projects` — create new project
   - `GET /projects` — list user's projects
   - `GET /projects/:id` — load a project
   - `PUT /projects/:id` — update project
   - `DELETE /projects/:id` — delete project

3. **Frontend: Project service**
   - Write `src/services/projectService.js`

4. **Frontend: Project store**
   - Write `src/store/projectStore.js`
   - Actions: createProject, loadProject, saveProject, deleteProject

5. **Dashboard page**
   - List saved projects as cards (name, date, thumbnail)
   - "New Project" button
   - Click to open a project in editor

6. **Auto-save**
   - Save project state every 30 seconds while editing
   - Show "Saved" / "Saving..." indicator in toolbar

**Phase 9 Done When:** User can save a project, close the app, reopen, and resume editing exactly where they left off.

---

## Phase 10 — Integration & End-to-End Flow

**Goal:** All phases connected into one seamless user journey.

### Steps

1. **Wire full user flow:**
   - Login → Dashboard → New Project → Draw Land → Set Requirements → Generate → Select Layout → Edit → View 3D → Save → Export PNG

2. **Fix all state synchronization issues**
   - Ensure land store, requirements store, layout store all stay in sync
   - Ensure editing updates propagate to 3D viewer

3. **Add loading states**
   - Show spinner during layout generation
   - Disable Generate button while request is in-flight

4. **Add error handling**
   - Handle API errors gracefully (toast notifications)
   - Handle invalid polygon input with helpful messages
   - Handle generation failures (no valid layout found) with explanation

5. **IPC review**
   - Ensure all Electron IPC handlers work correctly
   - Test file save dialog for PNG export

6. **Cross-check against PRD**
   - Verify every MVP feature from Section 12 of PRD is implemented
   - Mark anything missing as a bug

**Phase 10 Done When:** A first-time user can complete the full flow without developer intervention.

---

## Phase 11 — Testing & Bug Fixes

**Goal:** Stable, reliable app ready for real use.

### Steps

1. **Backend unit tests**
   - `test_polygon_utils.py` — polygon area, intersection detection
   - `test_layout_engine.py` — various plot sizes and room counts
   - `test_vastu_solver.py` — direction scoring
   - `test_auth.py` — register, login, token validation

2. **Frontend component tests**
   - `LandCanvas.test.jsx` — polygon drawing interactions
   - `geometry.test.js` — utility function correctness

3. **Manual edge case testing**
   - Very small plot (25×25 ft) + 3BHK (should warn/fail gracefully)
   - L-shaped / irregular polygon inputs
   - Conflicting Vastu rules (e.g., kitchen must be North AND South)
   - User edits room below minimum size

4. **Performance testing**
   - Generation time for large plots (60×60 ft, 4BHK) — must be < 10s
   - Canvas rendering with 10+ rooms — must stay smooth
   - 3D model with complex layout — check frame rate

5. **Fix all bugs found** — prioritize by severity:
   - P0: App crashes, data loss
   - P1: Wrong output, broken flow
   - P2: UI glitches, minor errors

**Phase 11 Done When:** All P0 and P1 bugs fixed. Test coverage on engine > 70%.

---

## Phase 12 — Polish & MVP Release

**Goal:** Ship a clean, usable MVP to first users.

### Steps

1. **UI polish**
   - Consistent spacing, typography, and color across all screens
   - Loading skeletons for project list
   - Empty states (no projects yet, no layout generated yet)
   - Responsive layout within the desktop window

2. **Onboarding**
   - First-time user tooltip walkthrough
   - Sample project pre-loaded on first login

3. **Disclaimer & legal**
   - Add disclaimer text per PRD Section 15 in app footer and export PDF header

4. **Electron packaging**
   - Configure `electron-builder` for Windows + macOS
   - Build installer: `.exe` (Windows), `.dmg` (macOS)
   - Test installer on clean machine

5. **Final PRD checklist**
   - [ ] Polygon land input ✓
   - [ ] AI layout generation ✓
   - [ ] Basic constraints ✓
   - [ ] 2D rendering + PNG export ✓
   - [ ] Basic 3D model ✓
   - [ ] Editing system ✓
   - [ ] User login + project save ✓

6. **Deploy backend**
   - Deploy FastAPI to a server (Railway / Render / VPS)
   - Set production environment variables
   - Test production API from packaged desktop app

7. **Release**
   - Tag `v1.0.0-mvp` in git
   - Share installer with first users
   - Set up feedback collection (simple form or email)

**Phase 12 Done When:** Packaged installer works on a fresh machine. MVP is in users' hands.

---

## 🔮 Post-MVP Roadmap (Future Phases)

| Feature | Notes |
|---|---|
| Realistic 3D rendering | Add textures, lighting, materials |
| ML-based layout generation | Train on real floor plan datasets |
| Cost estimation | Room area × regional construction cost per sqft |
| PDF export | Multi-page PDF with plan + room schedule |
| Structural analysis hints | Basic load-bearing wall suggestions |
| Interior design AI | Furniture placement suggestions |
| Cloud sync | Move from local SQLite to cloud DB |
| Mobile app | React Native viewer (view-only first) |
| API for builders | REST API for 3rd-party integrations |
| Full building code compliance | State-wise India building regulations |

---

## 📌 Development Tips

- **Build vertically, not horizontally.** Complete one thin slice end-to-end (e.g., a rectangle plot → 1BHK → one layout → visible in 2D) before adding breadth.
- **Hardcode before generalizing.** Make the engine work for a 30×40 rectangle first. Polygon support comes after.
- **Test the engine constantly.** The layout engine is the core value — run it on many inputs early and often.
- **Keep the UI dumb.** UI should just display and capture. All logic lives in the engine and stores.
- **Version your data schema early.** Project JSON format will change — add a `version` field from day one.

---

*Last updated: MVP Planning Phase*
