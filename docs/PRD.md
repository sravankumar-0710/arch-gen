# 🏗️ Product Requirements Document (PRD)
## Product Name: ArchGen AI (Working Title)

---

# 1. Product Overview

ArchGen AI is a desktop-based intelligent architectural design system that generates real-world usable 2D floor plans and basic 3D models based on:

- Custom land shapes (including polygon plots)
- User requirements (rooms, placement, constraints)
- Orientation (road position, North direction, Vastu)

The system combines:
- AI-driven layout generation
- Rule-based architectural constraints
- Manual editing tools

---

# 2. Product Vision

To build a tool that:
- Serves homeowners, students, and professionals
- Generates practical, construction-aware layouts
- Bridges the gap between idea → real-world architecture

---

# 3. Key Capabilities

## 3.1 Input System

Users can define:

### Land Input
- Rectangular or polygon plots (drawn on a grid/plane)
- Dimensions (feet/meters)
- Road position (front/side/back)
- Orientation (North direction)

### Requirements Input
- Basic mode:
  - e.g., 2BHK, 1 floor
- Advanced mode:
  - Room-specific constraints:
    - Kitchen direction (e.g., South)
    - Door orientation (e.g., North-facing)
    - Balcony size (e.g., +5 ft)
    - Staircase position
    - Attached bathrooms

---

## 3.2 AI Layout Generator

- Generates multiple layout options
- Uses:
  - AI-based layout generation
  - Constraint satisfaction logic

Constraints applied:
- Room adjacency rules
- Minimum room sizes
- Door/window placement logic
- Ventilation and lighting
- Vastu compliance
- Basic building codes (India-focused)

---

## 3.3 2D Floor Plan Generator

- Clean architectural layout
- Room labels
- Dimensions
- Wall thickness representation

Output formats:
- Image (PNG)
- PDF (future)

---

## 3.4 3D Model Generator (Basic - MVP)

- Converts 2D plan → 3D structure
- Includes:
  - Walls
  - Floors
  - Roof

---

## 3.5 Editing System

- Drag-and-drop room editing
- Resize rooms
- Move walls
- Undo/Redo support
- Version history

---

## 3.6 User System

- Login/Signup
- Save projects
- Load previous designs

---

# 4. User Flow

1. User opens desktop app
2. Logs in
3. Draws or inputs land shape
4. Sets orientation + road position
5. Inputs requirements
6. Clicks “Generate”
7. System generates multiple layouts
8. User selects one
9. Edits/customizes
10. Views 2D + 3D
11. Saves/export

---

# 5. System Design (Core Logic)

## Layout Engine

Hybrid system:

- Rule-Based Layer: enforces minimum sizes, geometry, feasibility
- AI Layer: suggests layout arrangements and optimizations
- Constraint Solver: handles Vastu rules, directions, and user conditions

---

# 6. Functional Requirements

- Support polygon plotting
- Validate all inputs
- Generate multiple valid layouts
- Allow editing without breaking constraints
- Maintain geometric correctness

---

# 7. Non-Functional Requirements

- Generation time: < 5–10 seconds
- Stable rendering for complex plots
- Smooth editing experience
- Scalable architecture

---

# 8. Constraints & Limitations

- Not a licensed architectural approval system
- Structural engineering not guaranteed
- Complex plots may produce limited solutions
- Partial building code compliance (MVP)

---

# 9. Risks & Edge Cases

- Invalid or conflicting user inputs
- AI generating unusable layouts
- Performance issues for large plots

---

# 10. Do’s & Don’ts

## Do’s
- Enforce minimum room sizes
- Respect direction constraints
- Provide multiple layout options
- Allow user corrections

## Don’ts
- Generate impossible layouts
- Ignore building constraints
- Overcomplicate UI
- Claim legal approval

---

# 11. Example Use Case

Input:
- Custom polygon land
- North-facing road
- 2 Bedrooms
- Kitchen in South
- North-facing entrance
- Balcony extended by 5 ft

Output:
- Multiple valid layouts
- 2D plan
- Basic 3D model
- Editable structure

---

# 12. MVP Scope

Included:
- Polygon land input
- AI layout generation
- Basic constraints
- 2D rendering
- Basic 3D model
- Editing system
- User login

Excluded:
- Advanced 3D textures
- Full building code compliance
- Cost estimation
- AR/VR

---

# 13. Future Enhancements

- Realistic 3D rendering
- Cost estimation
- Structural analysis
- Interior design AI
- Mobile app
- Cloud sync
- API for builders

---

# 14. Differentiation

Combines:
- AI generation
- Real-world constraints
- Vastu compliance
- Editable layouts

---

# 15. Disclaimer

This software provides conceptual architectural plans and should not replace professional consultation.

---

# End of PRD
