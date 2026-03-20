# 🤖 AI Rules — ArchGen AI
> These rules govern how AI assistants must write, structure, and reason about code in this project.
> Every rule here is non-negotiable unless explicitly overridden by the developer.

---

## 1. 🗂️ Tech Stack (Locked)

AI must always use the following stack. Never suggest replacements unless the chosen library provably cannot do the job.

### Frontend
- **Framework:** React + Vite
- **Language:** Plain JavaScript — `.js` and `.jsx` only. No TypeScript.
- **State:** Zustand — all global state lives in stores under `src/store/`
- **Styling:** Tailwind CSS — no inline styles, no styled-components, no plain CSS files
- **2D Canvas:** Konva.js + react-konva
- **3D Viewer:** React Three Fiber (`@react-three/fiber`) + `@react-three/drei`
- **Routing:** React Router DOM
- **HTTP:** Axios via `src/services/api.js`

### Backend
- **Language:** Python
- **Framework:** FastAPI
- **Data Validation:** Pydantic models for all request and response shapes — no raw dicts as I/O
- **ORM:** SQLAlchemy — always use ORM, never raw SQL (exception: migration files only)
- **Geometry:** Shapely — never write raw polygon math when Shapely can do it
- **Auth:** `python-jose` for JWT, `passlib` for password hashing
- **Image output:** Pillow for 2D floor plan PNG generation
- **Numerical ops:** NumPy

### Desktop Shell
- **Shell:** Electron
- **Bridge:** `contextBridge` in `preload.js` — frontend never calls Node APIs directly
- **IPC:** All Electron ↔ Frontend communication goes through `electron/ipc/` handlers

### Database
- **Dev:** SQLite via SQLAlchemy
- **Prod:** PostgreSQL via SQLAlchemy — same ORM code, different connection URL
- **Migrations:** Plain SQL files numbered sequentially under `database/migrations/`

---

## 2. 📁 File & Folder Rules

- **One component per file.** No exceptions.
- **One concern per module.** A file that renders UI must not contain engine logic.
- **File placement must match `structure.md`.** Never create files outside the defined structure without noting why.
- **Every new file must start with a header comment:**

```js
// filepath: src/components/land-input/LandCanvas.jsx
// Purpose: Grid canvas for drawing and displaying the plot polygon
```

```python
# filepath: backend/engine/geometry/polygon_utils.py
# Purpose: Polygon decomposition, validation, and area utilities using Shapely
```

---

## 3. 🏷️ Naming Conventions

| Context | Convention | Example |
|---|---|---|
| React components | PascalCase | `LandCanvas.jsx`, `RoomLabel.jsx` |
| JS functions & variables | camelCase | `handlePolygonClose`, `landStore` |
| JS files (non-component) | camelCase | `authService.js`, `geometry.js` |
| Python files | snake_case | `polygon_utils.py`, `vastu_solver.py` |
| Python functions & variables | snake_case | `get_room_area()`, `plot_polygon` |
| Python classes | PascalCase | `RoomConstraint`, `LayoutResult` |
| Zustand store hooks | camelCase, use prefix | `useLandStore`, `useEditorStore` |
| Zustand actions | camelCase verbs | `setPolygonPoints`, `loadProject` |
| Constants | UPPER_SNAKE_CASE | `MIN_ROOM_SIZE_SQFT`, `DEFAULT_CEILING_HEIGHT` |

---

## 4. 💬 Comments & Documentation

- **Comment non-obvious logic only.** Self-explanatory code needs no comment.
- **All Python public functions must have a docstring:**

```python
def compute_polygon_area(points: list[tuple]) -> float:
    """
    Computes the area of a polygon given a list of (x, y) coordinate tuples.
    Uses Shapely's Polygon area calculation. Returns area in square feet.
    """
```

- **All geometry and math logic must include a comment explaining the approach:**

```python
# Using Shapely's .contains() to verify all room rectangles fit within the plot boundary
```

- **Never leave vague comments** like `# fix this`, `# do stuff`, or `# temp`.
- **TODOs must always reference the plan phase:**

```js
// TODO(phase-7): Add snap-to-grid logic during room drag
```

```python
# TODO(phase-5b): Replace heuristic scorer with trained ML model
```

---

## 5. ⚙️ React Component Rules

- **Functional components only.** No class components, ever.
- **Strict structure order inside every component:**
  1. Imports
  2. Constants / config (if any)
  3. Hook calls (`useState`, `useEffect`, custom hooks)
  4. Event handlers and derived values
  5. Return JSX

- **No business logic inside components.** Logic belongs in:
  - Custom hooks → `src/hooks/`
  - Zustand stores → `src/store/`
  - Utility functions → `src/utils/`

- **Props must always be destructured at the function signature:**

```jsx
// ✅ Correct
export default function RoomLabel({ roomName, width, height }) { ... }

// ❌ Wrong
export default function RoomLabel(props) {
  const name = props.roomName
```

- **Never use array index as a React key** unless the list is static and will never be reordered.
- **All components must have a default export.**

---

## 6. 🗃️ Zustand Store Rules

- Every store lives in `src/store/` — one file per domain.
- Store files export a single `useXxxStore` hook as default.
- All actions are defined inside the store — not outside.
- Stores must never directly import or call other stores.
- Every store must include a `reset` action that restores initial state.

```js
// ✅ Correct store structure
import { create } from 'zustand'

const useLandStore = create((set) => ({
  polygonPoints: [],
  roadSide: null,
  northAngle: 0,
  unit: 'ft',
  setPolygonPoints: (points) => set({ polygonPoints: points }),
  setRoadSide: (side) => set({ roadSide: side }),
  setNorthAngle: (angle) => set({ northAngle: angle }),
  setUnit: (unit) => set({ unit }),
  reset: () => set({ polygonPoints: [], roadSide: null, northAngle: 0, unit: 'ft' }),
}))

export default useLandStore
```

---

## 7. 🌐 API & Services Rules

- **All API calls go through `src/services/`** — never call Axios directly inside a component or store.
- **`src/services/api.js`** is the single Axios instance with base URL and auth header injection.
- Each service file exports named async functions — no default exports.
- Services must catch errors and re-throw with a meaningful message:

```js
// src/services/generatorService.js
export async function generateLayout(payload) {
  try {
    const response = await api.post('/generate', payload)
    return response.data
  } catch (error) {
    throw new Error(`Layout generation failed: ${error.response?.data?.message || error.message}`)
  }
}
```

---

## 8. 🐍 FastAPI Backend Rules

- **Route handlers must be thin.** Routes only parse input and call a service function. No logic in routes.
- **All business logic lives in `backend/services/`.**
- **All request and response bodies use Pydantic models.** Never use raw dicts as I/O.
- **Consistent response envelope for all endpoints:**

```python
# Success
{ "success": True, "data": { ... }, "message": "Layout generated successfully" }

# Error
{ "success": False, "data": None, "message": "Plot area is too small for the requested rooms" }
```

- **Raise `HTTPException` for all API errors.** Never return a 200 with an error body.
- **Type hints are required on all public functions:**

```python
# ✅ Correct
def place_rooms(polygon: Polygon, rooms: list[RoomConstraint]) -> EngineResult:

# ❌ Wrong
def place_rooms(polygon, rooms):
```

- **Database queries live in `backend/services/` only** — never in routes, controllers, or engine files.

---

## 9. 🧠 Layout Engine Rules

The engine is the core value of this product. These rules are critical.

- **Rule logic and AI logic must always be in separate modules.** Never mix them in the same file.
- **Engine functions must be pure:** same input → same output. No side effects, no I/O, no randomness without a seed.
- **Every engine function must return an `EngineResult` object** with result data AND a warnings list:

```python
from dataclasses import dataclass, field

@dataclass
class EngineResult:
    success: bool
    data: dict | None
    warnings: list[str] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)
```

- **Vastu and constraint rules must be defined as Python classes** with a `validate(layout) -> EngineResult` method. No scattered if/else chains.
- **All polygon inputs must pass through `polygon_utils.py` validation** before reaching any engine function. Engine functions may assume a valid polygon.
- **Always use Shapely for geometry.** Never write raw area, intersection, or containment math.
- **Document the source of every rule constant:**

```python
# India NBC 2016, Part 3, Section 4.2 — minimum habitable room area
MIN_BEDROOM_AREA_SQFT = 100  # 10ft × 10ft minimum
```

- **The `layout_engine.py` orchestrator is the only entry point** into the engine from services. Never call sub-modules directly from outside the engine.

---

## 10. 🔐 Environment & Config Rules

- **Never hardcode secrets, API keys, ports, or URLs anywhere in the codebase.**
- All environment variables are read from `.env` files only.
- **Centralize all env vars:**
  - Frontend: `src/config.js` reads from `import.meta.env`
  - Backend: `backend/config.py` reads from `os.getenv()`
- **App must crash loudly on startup if required env vars are missing:**

```python
# backend/config.py
import os

DATABASE_URL = os.getenv("DATABASE_URL")
SECRET_KEY = os.getenv("SECRET_KEY")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set. App cannot start.")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is not set. App cannot start.")
```

- `.env` is always in `.gitignore`. `.env.example` is always committed with placeholder values.

---

## 11. 🗄️ Database Rules

- **Always use SQLAlchemy ORM.** Raw SQL is only allowed inside migration files.
- **All queries go in `backend/services/`.** Never in routes, controllers, or engine files.
- **Every model must have:** `id`, `created_at`, `updated_at` fields.
- **JSON blobs** (land data, layout data, requirements) are stored as SQLAlchemy `JSON` columns — never manually `json.dumps()` before saving.
- **Migrations are numbered sequentially:** `001_create_users.sql`, `002_create_projects.sql`, etc.

---

## 12. 🖥️ Electron Rules

- The frontend never calls Node.js or OS APIs directly.
- All native operations (file save dialog, file read, app version) go through the `contextBridge` in `preload.js`.
- IPC handlers live in `electron/ipc/` — one file per domain (`auth.ipc.js`, `project.ipc.js`, `generate.ipc.js`).
- IPC channel names follow the format: `domain:action` — e.g., `project:save`, `generate:run`.

---

## 13. 🚫 Hard Rules — Never Do These

- ❌ Never use `console.log` in production code — use a dedicated logger utility
- ❌ Never hardcode secrets, ports, or base URLs
- ❌ Never use deprecated APIs or libraries
- ❌ Never write business logic inside a React component
- ❌ Never call the database from a route handler or engine file
- ❌ Never write raw polygon/geometry math when Shapely can handle it
- ❌ Never return HTTP 200 with an error body from the API
- ❌ Never create files outside `structure.md` without explicitly noting the reason
- ❌ Never mix rule-based engine logic with AI layer logic in the same file
- ❌ Never leave a TODO without a phase reference: `// TODO(phase-X):`
- ❌ Never call Axios directly inside a component — always go through `src/services/`
- ❌ Never let a Zustand store import another store

---

## 14. 🔄 AI Behavior Rules

### When building a feature:
- **Build backend first, then frontend** — always in this order unless told otherwise.
- **Explain each file's purpose briefly** — one line per file is enough, no deep breakdowns unless asked.
- **Keep store + component + service in sync.** If a component reads from a store, the store must have those fields. If a component calls a service, the service must be wired to the API.

### When unsure about a requirement:
- **Make a reasonable assumption, write the code, and note the assumption clearly:**

```js
// ASSUMPTION: roadSide is one of: 'front' | 'left' | 'right' | 'back'
// Update RoadPositionPicker if this changes
```

### When refactoring:
- **Only refactor if it directly blocks the current task.**
- Otherwise add a `// TODO(refactor):` comment and move on. Never silently rewrite unrelated code.

### When explaining output:
- Give a **short summary** of what was built.
- Call out any **assumptions made** and **edge cases not yet handled**.

### Tradeoff priority order:
1. **Correctness** — the output must be right
2. **Readability** — the code must be easy to understand
3. **Simplicity** — prefer the simpler solution
4. **Flexibility** — generalize only when there is a real, present need

---

## 15. 🧪 Testing Rules

- Tests are **required** for all engine and utility files:
  - `backend/engine/**`
  - `backend/utils/**`
  - `src/utils/**`
- UI component tests are written only when explicitly requested.
- Test files mirror the source structure under `tests/`.
- Each test file tests one module only.
- Test function names must describe the exact scenario being tested:

```python
def test_polygon_area_returns_correct_value_for_rectangle():
def test_vastu_solver_flags_kitchen_placed_in_north():
def test_layout_engine_returns_warning_for_undersized_plot():
```

---

## 16. 📐 Geometry & Canvas Rules

- All geometry operations use **Shapely** on the backend — no exceptions.
- Frontend canvas interactions use **Konva.js** — no raw HTML Canvas API calls.
- All polygon inputs from the user must be validated in `src/utils/geometry.js` **before** being sent to the backend:
  - Minimum 3 points
  - No self-intersections
  - Minimum area threshold met
- **3D model code uses React Three Fiber exclusively.** Never manipulate `THREE` objects directly inside component bodies — use refs or hooks from `@react-three/drei`.

---

*These rules apply to every file, every session, every feature — no exceptions unless explicitly discussed and overridden by the developer.*
