# 🏗️ ArchGen AI — Project File Structure

```
archgen-ai/
│
├── README.md
├── .env
├── .env.example
├── .gitignore
├── package.json                        # Root (monorepo or desktop app config)
│
├── electron/                           # Electron desktop app shell
│   ├── main.js                         # Main process entry point
│   ├── preload.js                      # Preload script (context bridge)
│   └── ipc/
│       ├── auth.ipc.js                 # IPC handlers for auth
│       ├── project.ipc.js              # IPC handlers for project save/load
│       └── generate.ipc.js             # IPC handlers for layout generation
│
├── src/                                # Frontend (React + Vite or similar)
│   ├── main.jsx                        # React app entry point
│   ├── App.jsx                         # Root component + routing
│   │
│   ├── assets/                         # Static assets
│   │   ├── fonts/
│   │   ├── icons/
│   │   └── images/
│   │
│   ├── styles/                         # Global styles
│   │   ├── global.css
│   │   ├── variables.css               # CSS custom properties (theme)
│   │   └── animations.css
│   │
│   ├── pages/                          # Route-level pages
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── DashboardPage.jsx           # Project listing
│   │   ├── EditorPage.jsx              # Main design editor
│   │   └── NotFoundPage.jsx
│   │
│   ├── components/                     # Reusable UI components
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Tooltip.jsx
│   │   │   ├── Loader.jsx
│   │   │   └── Notification.jsx
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   └── SignupForm.jsx
│   │   │
│   │   ├── land-input/
│   │   │   ├── LandCanvas.jsx          # Grid canvas for drawing plot
│   │   │   ├── PolygonDrawer.jsx       # Polygon tool
│   │   │   ├── DimensionInput.jsx      # Width/height fields
│   │   │   ├── RoadPositionPicker.jsx  # Front/side/back road selector
│   │   │   └── OrientationPicker.jsx   # North direction compass
│   │   │
│   │   ├── requirements/
│   │   │   ├── BasicModeForm.jsx       # 2BHK / floors selector
│   │   │   ├── AdvancedModeForm.jsx    # Room-specific constraints form
│   │   │   ├── RoomConstraintRow.jsx   # Single room constraint entry
│   │   │   └── VastuOptions.jsx        # Vastu compliance toggles
│   │   │
│   │   ├── layout-generator/
│   │   │   ├── GenerateButton.jsx
│   │   │   ├── LayoutOptionCard.jsx    # Thumbnail of a generated layout
│   │   │   └── LayoutSelector.jsx      # Grid of layout options to pick from
│   │   │
│   │   ├── floor-plan/
│   │   │   ├── FloorPlanCanvas.jsx     # 2D plan renderer (canvas/SVG)
│   │   │   ├── RoomLabel.jsx
│   │   │   ├── WallRenderer.jsx
│   │   │   ├── DimensionOverlay.jsx
│   │   │   └── ExportButton.jsx        # PNG export
│   │   │
│   │   ├── editor/
│   │   │   ├── EditorToolbar.jsx       # Toolbar with edit tools
│   │   │   ├── DragDropRoom.jsx        # Draggable room component
│   │   │   ├── ResizeHandle.jsx
│   │   │   ├── WallEditor.jsx
│   │   │   ├── UndoRedoControls.jsx
│   │   │   └── VersionHistoryPanel.jsx
│   │   │
│   │   └── model-3d/
│   │       ├── ThreeDViewer.jsx        # Three.js / Babylon.js canvas
│   │       ├── WallMesh.jsx
│   │       ├── FloorMesh.jsx
│   │       └── RoofMesh.jsx
│   │
│   ├── hooks/                          # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useProject.js
│   │   ├── useCanvas.js
│   │   ├── useUndoRedo.js
│   │   ├── useLayoutGenerator.js
│   │   └── use3DModel.js
│   │
│   ├── context/                        # React context providers
│   │   ├── AuthContext.jsx
│   │   ├── ProjectContext.jsx
│   │   └── EditorContext.jsx
│   │
│   ├── store/                          # State management (Zustand / Redux)
│   │   ├── authStore.js
│   │   ├── projectStore.js
│   │   ├── landStore.js
│   │   ├── requirementsStore.js
│   │   ├── layoutStore.js
│   │   └── editorStore.js
│   │
│   ├── services/                       # API + backend service calls
│   │   ├── api.js                      # Axios / fetch base config
│   │   ├── authService.js
│   │   ├── projectService.js
│   │   └── generatorService.js         # Calls layout generation API
│   │
│   └── utils/                          # Frontend utility functions
│       ├── geometry.js                 # Polygon math helpers
│       ├── canvasHelpers.js
│       ├── exportUtils.js              # PNG export logic
│       ├── vastuRules.js               # Vastu direction mappings
│       └── validators.js               # Input validation helpers
│
│
├── backend/                            # Python or Node.js backend
│   ├── app.py                          # (Flask/FastAPI) OR app.js (Express)
│   ├── config.py                       # App config / env loading
│   ├── requirements.txt                # Python dependencies
│   │
│   ├── routes/
│   │   ├── auth_routes.py
│   │   ├── project_routes.py
│   │   └── generator_routes.py
│   │
│   ├── controllers/
│   │   ├── auth_controller.py
│   │   ├── project_controller.py
│   │   └── generator_controller.py
│   │
│   ├── models/                         # DB models (SQLAlchemy / Mongoose)
│   │   ├── user_model.py
│   │   └── project_model.py
│   │
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── project_service.py
│   │   └── layout_service.py           # Orchestrates AI + rule engine
│   │
│   ├── engine/                         # Core layout generation engine
│   │   ├── __init__.py
│   │   ├── layout_engine.py            # Entry point for generation pipeline
│   │   │
│   │   ├── rule_based/
│   │   │   ├── __init__.py
│   │   │   ├── room_size_rules.py      # Min/max room dimensions
│   │   │   ├── adjacency_rules.py      # Room adjacency constraints
│   │   │   ├── door_window_rules.py    # Placement logic
│   │   │   ├── ventilation_rules.py
│   │   │   └── building_code_rules.py  # India-specific basic codes
│   │   │
│   │   ├── ai_layer/
│   │   │   ├── __init__.py
│   │   │   ├── layout_generator.py     # AI model interface
│   │   │   ├── model_loader.py         # Load trained/pretrained model
│   │   │   └── prompt_builder.py       # Prompt engineering for LLM-based gen
│   │   │
│   │   ├── constraint_solver/
│   │   │   ├── __init__.py
│   │   │   ├── vastu_solver.py         # Vastu direction constraints
│   │   │   ├── orientation_solver.py   # Road + North alignment
│   │   │   └── conflict_resolver.py    # Resolves constraint conflicts
│   │   │
│   │   └── geometry/
│   │       ├── __init__.py
│   │       ├── polygon_utils.py        # Polygon decomposition + validation
│   │       ├── room_placer.py          # Places rooms within polygon
│   │       └── wall_builder.py         # Builds wall geometry from rooms
│   │
│   ├── renderer/
│   │   ├── __init__.py
│   │   ├── floorplan_renderer.py       # Generates 2D PNG output
│   │   └── model_exporter.py           # Exports 3D model data (JSON/OBJ)
│   │
│   ├── middleware/
│   │   ├── auth_middleware.py
│   │   └── error_handler.py
│   │
│   └── utils/
│       ├── logger.py
│       ├── response_helper.py
│       └── file_utils.py
│
│
├── database/
│   ├── schema.sql                      # SQL schema (if using PostgreSQL/SQLite)
│   ├── migrations/
│   │   ├── 001_create_users.sql
│   │   └── 002_create_projects.sql
│   └── seed.py                         # Dev seed data
│
│
├── ml_models/                          # Trained AI models (if local)
│   ├── layout_model_v1/
│   │   ├── model.pkl                   # Or .pt / .onnx depending on framework
│   │   └── config.json
│   └── README.md                       # Model documentation
│
│
├── tests/
│   ├── frontend/
│   │   ├── components/
│   │   │   └── LandCanvas.test.jsx
│   │   └── utils/
│   │       └── geometry.test.js
│   │
│   └── backend/
│       ├── test_layout_engine.py
│       ├── test_vastu_solver.py
│       ├── test_polygon_utils.py
│       ├── test_auth.py
│       └── test_project.py
│
│
├── docs/
│   ├── PRD.md                          # Original product requirements
│   ├── structure.md                    # This file
│   ├── architecture.md                 # System architecture overview
│   ├── api_reference.md                # Backend API endpoints
│   └── engine_design.md               # Layout engine internals
│
│
└── scripts/
    ├── setup.sh                        # Dev environment setup
    ├── run_dev.sh                      # Start dev servers
    └── build.sh                        # Production build script
```

---

## 📦 Key Dependencies (Reference)

### Frontend
| Package | Purpose |
|---|---|
| React | UI framework |
| Vite | Build tool |
| Zustand | State management |
| Three.js / React Three Fiber | 3D model viewer |
| Konva.js / Fabric.js | 2D canvas editing |
| React Router | Page routing |
| Axios | API calls |

### Backend
| Package | Purpose |
|---|---|
| FastAPI / Flask | REST API server |
| SQLAlchemy | ORM for database |
| Shapely | Polygon geometry operations |
| NumPy | Numerical computations |
| Pillow | 2D floor plan image rendering |
| PyTorch / ONNX | AI model inference |
| python-jose | JWT auth tokens |

### Desktop Shell
| Package | Purpose |
|---|---|
| Electron | Desktop app wrapper |
| electron-builder | Packaging & distribution |

---

## 🗂️ Module Responsibility Summary

| Directory | Responsibility |
|---|---|
| `electron/` | Desktop app shell, IPC bridge |
| `src/components/land-input/` | Plot drawing and orientation |
| `src/components/requirements/` | Room & constraint inputs |
| `src/components/layout-generator/` | Trigger generation, display options |
| `src/components/floor-plan/` | 2D plan rendering and export |
| `src/components/editor/` | Drag/drop editing, undo/redo |
| `src/components/model-3d/` | 3D model viewer |
| `backend/engine/rule_based/` | Architectural constraint rules |
| `backend/engine/ai_layer/` | AI layout generation |
| `backend/engine/constraint_solver/` | Vastu + orientation solving |
| `backend/engine/geometry/` | Polygon math + room placement |
| `backend/renderer/` | PNG output + 3D data export |
| `ml_models/` | Stored trained models |
| `tests/` | Unit + integration tests |
