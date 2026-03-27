# 📄 ArchGen AI — Product Requirements Document (PRD)

> **Version:** 1.0 — MVP
> **Status:** Active
> **Last Updated:** March 2026
> **Author:** ArchGen AI Team

---

## 1. 🧭 Executive Summary

**ArchGen AI** is an AI-powered, desktop-first floor plan generator for the Indian residential market. It enables homeowners, architects, and civil engineers to generate multiple valid 2D floor plan layouts from a plot of land and a set of room requirements — in seconds.

The tool combines a rule-based architectural constraint engine with a heuristic AI layout generator to produce layouts that conform to Indian building codes, Vastu Shastra guidelines, and good architectural practice. Users can then edit, view in 3D, and export their plans — all from a single offline-capable desktop application.

---

## 2. 🎯 Problem Statement

Designing a residential floor plan in India today is:

- **Time-consuming:** Architects spend hours drafting initial options manually.
- **Expensive:** Homeowners without architectural connections pay significant fees for basic concepts.
- **Vastu-constrained:** Most Indian clients require Vastu compliance, which adds a layer of complexity that trained architects handle intuitively but software rarely addresses.
- **Iterative by nature:** Clients want to see multiple options before committing — a process that is slow and costly in the traditional workflow.

There is no accessible, intelligent tool that lets a non-architect user input their land dimensions, room requirements, and Vastu preferences — and instantly receive multiple valid, architecturally sound layout options.

---

## 3. 👥 Target Users

| User Type | Description | Primary Need |
|---|---|---|
| **Homeowner (primary)** | Planning a new home on owned land | See layout options without paying an architect for early concepts |
| **Civil Engineer** | Handling residential projects in Tier 2/3 cities | Speed up initial layout ideation for clients |
| **Junior Architect** | Early-stage design exploration | Generate starting points to iterate upon |
| **Interior Designer** | Working with an existing shell layout | Understand space constraints for a given plot |

**MVP focus:** Homeowner and civil engineer use cases.

---

## 4. 🌏 Market Context

- India has 63 million urban households, with millions of new homes built yearly.
- The Vastu compliance market is a distinct, underserved requirement unique to the Indian subcontinent.
- Existing tools (AutoCAD, RoomSketcher, Planner 5D) are either too complex, Vastu-unaware, or require manual drafting.
- No widely-used Indian-market tool bridges AI layout generation + Vastu + building code compliance in one product.

---

## 5. 🔑 Core Value Propositions

1. **Instant multi-option generation** — Get 3–5 layout variations from a single input set in under 10 seconds.
2. **Vastu-aware** — Optional Vastu compliance scoring and filtering is a first-class feature, not an afterthought.
3. **India-specific rules** — Built around National Building Code (NBC 2016) room size minimums and setback rules.
4. **Offline-capable desktop app** — Works without internet via Electron shell; no cloud subscription required.
5. **Zero learning curve for basics** — A homeowner with no architectural training can produce a usable layout in under 5 minutes.
6. **Editable output** — Generated layouts are starting points, not take-it-or-leave-it outputs. Users can drag, resize, and adjust rooms.

---

## 6. 🚫 Out of Scope (MVP)

The following are explicitly **not** in scope for the MVP:

- Structural engineering analysis (beam/column placement, load calculations)
- MEP (mechanical, electrical, plumbing) layout
- Realistic 3D rendering with textures and lighting
- Multi-storey full building design (MVP: 1–3 floors, simple stacked)
- Construction cost estimation
- PDF export with full drawing sheet layout
- Mobile app (iOS/Android)
- Cloud sync / multi-device access
- Multi-user collaboration
- State-wise or municipal building regulation compliance (beyond basic NBC)
- Site plan / landscape design

---

## 7. 🖥️ Platform & Distribution

| Attribute | Value |
|---|---|
| **Platform** | Desktop application (Windows primary, macOS secondary) |
| **Shell** | Electron |
| **Distribution** | Installable `.exe` (Windows) / `.dmg` (macOS) |
| **Backend** | Local FastAPI server bundled with app OR remote hosted API |
| **Internet requirement** | Optional (core generation works offline; account sync requires internet) |
| **Minimum OS** | Windows 10 / macOS 12+ |

---

## 8. 🗺️ User Journey (Happy Path)

```
[Launch App]
     │
     ▼
[Login / Sign Up]
     │
     ▼
[Dashboard — My Projects]
     │
     ├── New Project ──▶ [Step 1: Draw Land / Input Dimensions]
     │                         │
     │                   [Step 2: Set Road Position + North Orientation]
     │                         │
     │                   [Step 3: Choose Mode — Basic / Advanced]
     │                         │
     │                   [Step 4: Enter Room Requirements]
     │                         │
     │                   [Step 5: Set Vastu Preferences]
     │                         │
     │                   [Generate →]
     │                         │
     │                   [View 3–5 Layout Options]
     │                         │
     │                   [Select a Layout]
     │                         │
     │                   [Edit — Drag / Resize / Adjust]
     │                         │
     │                   [View in 3D]
     │                         │
     │                   [Export PNG]
     │                         │
     └── Load Existing ◀ [Auto-saved to Project]
```

---

## 9. 📋 Feature Requirements

### 9.1 Authentication

| ID | Feature | Priority |
|---|---|---|
| AUTH-1 | User registration with email + password | P0 |
| AUTH-2 | User login with JWT token | P0 |
| AUTH-3 | Persistent session (token stored locally, auto-login on reopen) | P0 |
| AUTH-4 | Logout | P0 |
| AUTH-5 | Password reset flow | P2 (post-MVP) |

---

### 9.2 Land Input & Canvas

| ID | Feature | Priority |
|---|---|---|
| LAND-1 | Draw a custom polygon plot by clicking points on a grid canvas | P0 |
| LAND-2 | Input a rectangular plot via Width × Height fields | P0 |
| LAND-3 | Unit toggle: feet ↔ meters | P0 |
| LAND-4 | Select which side of the plot faces the road (front/left/right/back) | P0 |
| LAND-5 | Set North direction via an interactive compass | P0 |
| LAND-6 | Live dimension labels on canvas edges | P1 |
| LAND-7 | Polygon point editing (drag to reposition vertices) | P1 |
| LAND-8 | Minimum plot area validation (< 250 sqft → error) | P0 |
| LAND-9 | Self-intersecting polygon detection + error message | P0 |
| LAND-10 | Show plot area (sqft / sqm) as the user draws | P1 |

---

### 9.3 Requirements Input

| ID | Feature | Priority |
|---|---|---|
| REQ-1 | **Basic Mode:** Select number of bedrooms (1–5) and floors (1–3) | P0 |
| REQ-2 | **Basic Mode:** Checkboxes for attached baths, living room, dining, kitchen | P0 |
| REQ-3 | **Advanced Mode:** Per-room constraint rows (type, min size, preferred direction, special flags) | P1 |
| REQ-4 | Add / remove room rows dynamically in advanced mode | P1 |
| REQ-5 | **Vastu panel:** Toggle to enable Vastu compliance | P0 |
| REQ-6 | Show default Vastu direction rules per room type (read-only reference) | P1 |
| REQ-7 | Allow per-room Vastu override in advanced mode | P2 |
| REQ-8 | Warn user if total rooms exceed plot area capacity estimate | P1 |
| REQ-9 | Warn on conflicting direction constraints between rooms | P1 |

---

### 9.4 Layout Generation Engine

| ID | Feature | Priority |
|---|---|---|
| GEN-1 | Generate 3–5 distinct layout options from land + requirements input | P0 |
| GEN-2 | Generation completes in ≤ 10 seconds for standard inputs (≤ 60×60 ft, ≤ 4BHK) | P0 |
| GEN-3 | Enforce minimum room sizes per NBC 2016 guidelines | P0 |
| GEN-4 | Enforce building setbacks from plot boundary | P0 |
| GEN-5 | Enforce maximum plot coverage ratio | P0 |
| GEN-6 | Validate room adjacency constraints (kitchen near dining, etc.) | P0 |
| GEN-7 | Enforce entrance door on road-facing wall | P0 |
| GEN-8 | Ensure minimum 1 window per habitable room on an exterior wall | P0 |
| GEN-9 | Vastu compliance scoring per layout | P0 |
| GEN-10 | Orientation alignment: entrance faces road, North matches input | P0 |
| GEN-11 | Return constraint warnings alongside each layout (non-blocking) | P0 |
| GEN-12 | Handle complex (non-rectangular) polygon plots | P1 |
| GEN-13 | Support multi-floor layouts (stacked) | P1 |
| GEN-14 | Future: ML-based layout generation replacing heuristic | Post-MVP |

**NBC 2016 Minimum Room Dimensions (enforced by engine):**

| Room Type | Minimum Area | Minimum Width |
|---|---|---|
| Master Bedroom | 120 sqft (≈ 11.1 sqm) | 10 ft |
| Secondary Bedroom | 100 sqft (≈ 9.3 sqm) | 10 ft |
| Kitchen | 64 sqft (≈ 5.9 sqm) | 8 ft |
| Bathroom | 35 sqft (≈ 3.3 sqm) | 5 ft |
| Toilet | 20 sqft (≈ 1.9 sqm) | 4 ft |
| Living Room | 144 sqft (≈ 13.4 sqm) | 12 ft |
| Dining Room | 100 sqft (≈ 9.3 sqm) | 10 ft |

**Vastu Direction Map (default rules — encode in `vastu_solver.py`):**

| Room | Preferred Direction |
|---|---|
| Master Bedroom | Southwest |
| Bedroom 2+ | South, West |
| Kitchen | Southeast |
| Prayer Room / Pooja | Northeast |
| Living Room | North, East |
| Bathroom | East, North |
| Toilet | Northwest, South |
| Study | West, Northeast |
| Staircase | South, West |
| Entrance | North, East, Northeast |

---

### 9.5 2D Floor Plan Renderer

| ID | Feature | Priority |
|---|---|---|
| PLAN-1 | Render generated layout as a clean 2D floor plan (walls, rooms, labels) | P0 |
| PLAN-2 | Show room name centered inside each room | P0 |
| PLAN-3 | Show room dimensions (e.g., "12 × 10 ft") inside or beside each room | P0 |
| PLAN-4 | Show overall plot dimensions on plan edges | P1 |
| PLAN-5 | Show thumbnail previews of all generated layout options | P0 |
| PLAN-6 | Highlight / select active layout from thumbnail grid | P0 |
| PLAN-7 | Show dimension overlay on hover | P1 |
| PLAN-8 | Export current floor plan as PNG | P0 |
| PLAN-9 | PNG export saves to local disk via Electron file dialog | P0 |
| PLAN-10 | High-quality server-side PNG generation (Pillow) for export | P2 |

---

### 9.6 Editing System

| ID | Feature | Priority |
|---|---|---|
| EDIT-1 | Drag rooms to reposition on canvas | P0 |
| EDIT-2 | Snap to grid while dragging | P1 |
| EDIT-3 | Snap back with warning if dragged position violates rules | P1 |
| EDIT-4 | Resize rooms via drag handles | P1 |
| EDIT-5 | Enforce minimum room size during resize | P1 |
| EDIT-6 | Move shared walls (adjusts both adjacent rooms) | P2 |
| EDIT-7 | Unlimited Undo / Redo | P0 |
| EDIT-8 | Toolbar with: Select, Move, Resize, Add Room, Delete Room | P1 |
| EDIT-9 | "Validate Layout" button — re-runs all constraint checks | P1 |
| EDIT-10 | Inline warnings on rule violations (non-blocking) | P1 |
| EDIT-11 | Named version snapshots (save + restore points) | P2 |

---

### 9.7 3D Model Viewer

| ID | Feature | Priority |
|---|---|---|
| 3D-1 | Display basic 3D model of floor plan (walls, floors, flat roof) | P0 |
| 3D-2 | Color-coded rooms by type in 3D | P1 |
| 3D-3 | Orbit controls: rotate, zoom, pan | P0 |
| 3D-4 | Toggle: top-down plan view ↔ perspective view | P1 |
| 3D-5 | 3D model updates live when 2D plan is edited | P1 |
| 3D-6 | Export 3D model as `.obj` file | P2 |
| 3D-7 | Future: textures, materials, lighting | Post-MVP |

**Default 3D parameters:**
- Ceiling height: 10 ft (3.05 m), configurable in advanced options
- Wall thickness: 9 inches (standard Indian brick wall)
- Flat roof by default; hip/sloped roof post-MVP

---

### 9.8 Project Management

| ID | Feature | Priority |
|---|---|---|
| PROJ-1 | Create a named project | P0 |
| PROJ-2 | Dashboard listing all saved projects (name, last modified, thumbnail) | P0 |
| PROJ-3 | Open / load an existing project | P0 |
| PROJ-4 | Delete a project | P0 |
| PROJ-5 | Auto-save project state every 30 seconds while editing | P1 |
| PROJ-6 | "Saving..." / "Saved" indicator in toolbar | P1 |
| PROJ-7 | Empty state on dashboard (no projects yet) with CTA | P1 |

---

## 10. 🎨 UI / UX Requirements

### 10.1 Design Principles
- **Zero friction for basics.** The most common action (basic 2BHK generation for a rectangle plot) must require no more than 5 clicks + a few inputs.
- **Progressive disclosure.** Basic mode is the default; advanced mode is available but not forced on the user.
- **Non-blocking warnings.** The system warns but never hard-blocks user from seeing a layout or making an edit. The user is in control.
- **Feedback at every step.** Every action that takes time shows a loading state. Every error shows a human-readable explanation.

### 10.2 Key Screens

| Screen | Description |
|---|---|
| **Login / Signup** | Clean auth screen, minimal fields |
| **Dashboard** | Project card grid, "New Project" CTA prominent |
| **Editor — Land Input** | Left panel: inputs; Center: Konva canvas with grid |
| **Editor — Requirements** | Tabbed panel: Basic / Advanced / Vastu |
| **Editor — Generate** | Thumbnail row of layout options at top/bottom; main canvas shows selected |
| **Editor — Edit Mode** | Toolbar on top; canvas center; 3D viewer in side panel or toggle |
| **Export Dialog** | Simple save-to-disk dialog with format options |

### 10.3 Responsiveness
The app is a desktop-only tool. The minimum window size is **1280 × 800 px**. No mobile/tablet adaptation required in MVP.

---

## 11. ⚙️ Technical Requirements

### 11.1 Tech Stack (Locked — see `ai_rules.md` for full details)

| Layer | Technology |
|---|---|
| Frontend | React + Vite (JavaScript — `.js`/`.jsx` only, no TypeScript) |
| State Management | Zustand |
| Styling | Tailwind CSS |
| 2D Canvas | Konva.js + react-konva |
| 3D Viewer | React Three Fiber + @react-three/drei |
| Routing | React Router DOM |
| HTTP Client | Axios (via `src/services/api.js` only) |
| Desktop Shell | Electron |
| IPC | contextBridge + `electron/ipc/` handlers |
| Backend | Python + FastAPI |
| ORM | SQLAlchemy |
| Geometry | Shapely |
| Image Rendering | Pillow |
| Auth Tokens | python-jose (JWT) |
| Password Hashing | passlib |
| Database (dev) | SQLite |
| Database (prod) | PostgreSQL |

### 11.2 Performance Requirements

| Metric | Requirement |
|---|---|
| Layout generation time (standard input) | ≤ 10 seconds |
| Canvas frame rate (10+ rooms) | ≥ 30 fps |
| 3D model load time (standard layout) | ≤ 3 seconds |
| App launch time | ≤ 5 seconds |
| Auto-save write time | ≤ 1 second (non-blocking) |

### 11.3 Data Storage

All project data is stored in structured JSON columns in SQLite / PostgreSQL via SQLAlchemy:
- `land_data` — polygon points, unit, road side, north angle
- `requirements` — mode, room list, Vastu flag, floors
- `layout` — selected layout object (room positions, wall segments, scores)

> A `version` field is included in all stored JSON payloads from day one for forward compatibility.

### 11.4 Security

- Passwords hashed with `passlib` (bcrypt)
- JWT tokens signed with `SECRET_KEY` from `.env`
- All authenticated routes protected by `auth_middleware.py`
- No secrets, API keys, or base URLs hardcoded in source
- `.env` always in `.gitignore`; `.env.example` always committed

---

## 12. ✅ MVP Feature Checklist

The following is the minimum set of features required to call the product shippable:

- [ ] User can sign up and log in
- [ ] User can draw a polygon or rectangular plot on a canvas
- [ ] User can set road position and North orientation
- [ ] User can enter room requirements in Basic mode
- [ ] User can toggle Vastu compliance on/off
- [ ] System generates 3–5 valid layout options in ≤ 10 seconds
- [ ] Generated layouts are displayed as labeled 2D floor plans
- [ ] User can select a layout from thumbnail options
- [ ] User can drag rooms to reposition them
- [ ] User can undo/redo edits
- [ ] User can view the layout as a basic 3D model
- [ ] User can export the floor plan as a PNG
- [ ] User can save and reload a project
- [ ] Constraint violations are shown as non-blocking warnings
- [ ] App is packaged as an installable `.exe` for Windows

---

## 13. 📐 Architectural Constraints (Enforced in Engine)

> Source: India National Building Code 2016 (NBC 2016), Part 3

### Setbacks

| Location | Minimum Setback |
|---|---|
| Front (road-facing) | 1.5 m (≈ 5 ft) |
| Side | 0.9 m (≈ 3 ft) |
| Rear | 0.9 m (≈ 3 ft) |

### Coverage & FAR

| Parameter | Standard Value |
|---|---|
| Maximum plot coverage | 60% of plot area |
| Floor Area Ratio (FAR) | 1.5 default (typically 1.0–2.0, varies by zone) |

These values are encoded as named constants in `backend/engine/rule_based/building_code_rules.py` with NBC source references.

---

## 14. 🔮 Post-MVP Roadmap

| Feature | Target Phase |
|---|---|
| ML-based layout generation (trained model) | Phase 2 |
| Realistic 3D rendering (textures, lighting) | Phase 2 |
| PDF export (multi-page with room schedule) | Phase 2 |
| Construction cost estimation | Phase 3 |
| Structural hints (load-bearing wall suggestions) | Phase 3 |
| Interior design AI (furniture placement) | Phase 3 |
| Cloud sync + multi-device | Phase 3 |
| Mobile app (React Native, view-only) | Phase 4 |
| API for third-party builders | Phase 4 |
| State-wise India building code compliance | Phase 4 |

---

## 15. ⚠️ Disclaimer (Required in App)

> **ArchGen AI generates conceptual floor plans for reference and ideation purposes only.**
> The layouts produced are not certified architectural drawings and do not constitute professional architectural advice.
> All plans must be reviewed, approved, and stamped by a registered architect or engineer before construction.
> Compliance with local municipal building regulations, bye-laws, and structural requirements is the sole responsibility of the user.
> ArchGen AI makes no warranty of regulatory compliance for any generated plan.

This disclaimer must appear:
- In the app footer on the Editor screen
- On the header of any exported PNG or PDF

---

## 16. 📌 Open Questions (To Resolve Before Phase 5)

| # | Question | Owner | Status |
|---|---|---|---|
| 1 | Should the backend be bundled locally with Electron (offline) or hosted remotely? | Founder | Open |
| 2 | What is the exact FAR and setback table for the target user's city/zone? Default to NBC national minimums? | Founder | Open |
| 3 | What is the complete canonical Vastu rules list to encode in `vastu_solver.py`? | Domain Expert | Open |
| 4 | What AI/ML model approach for Phase 2? (GNN, diffusion model, LLM-prompting, or fine-tuned CNN on floor plan datasets?) | Tech Lead | Open |
| 5 | Multi-floor support: are rooms stacked directly or can each floor have a different layout? | Founder | Open |
| 6 | What is the pricing model? (One-time purchase, subscription, freemium?) | Founder | Open |

---

*This PRD is the source of truth for all MVP feature decisions. Any feature not listed here requires a PRD amendment before implementation.*
