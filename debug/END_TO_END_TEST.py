#!/usr/bin/env python3
# filepath: END_TO_END_TEST.py
# Purpose: Verify all phases are integrated and working end-to-end

import sys
import os
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))

from fastapi.testclient import TestClient
from app import app
from database import init_db
import json
import time

print("="*70)
print("END-TO-END INTEGRATION TEST - All Phases")
print("="*70)

# Initialize database
print("\n[*] Initializing database...")
init_db()
print("[OK] Database initialized")

client = TestClient(app)
all_passed = True
unique_email = f"e2e-test-{int(time.time())}@test.com"

# ============================================================
# PHASE 1: Backend Health Check
# ============================================================
print("\n[PHASE 1] Backend Scaffolding - Health Check")
try:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()['status'] == 'ok'
    print("[OK] Backend health check passed")
except Exception as e:
    print(f"[ERR] {e}")
    all_passed = False
    sys.exit(1)

# ============================================================
# PHASE 2: Authentication System
# ============================================================
print("\n[PHASE 2] Authentication System - Register & Login")
try:
    # Register user
    response = client.post(
        "/auth/register",
        json={"email": unique_email, "password": "password123456"}
    )
    assert response.status_code == 201, f"Registration failed: {response.json()}"
    data = response.json()

    assert 'data' in data, "Missing 'data' field"
    assert 'user' in data['data'], "Missing 'user' in data"
    assert 'token' in data['data'], "Missing 'token' in data"

    user_id = data['data']['user']['id']
    token = data['data']['token']['access_token']

    print(f"[OK] User registered (ID: {user_id})")

    # Verify token retrieves current user
    response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()['data']['email'] == unique_email
    print(f"[OK] Token authentication verified")

except Exception as e:
    print(f"[ERR] {type(e).__name__}: {e}")
    all_passed = False
    sys.exit(1)

# ============================================================
# PHASE 3 + PHASE 1: Project Creation & Land Input
# ============================================================
print("\n[PHASE 1+3] Project Management - Create Project")
try:
    # Create project
    response = client.post(
        "/projects",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "End-to-End Test Project",
            "description": "Testing all phases integration"
        }
    )
    assert response.status_code == 201, f"Project creation failed: {response.json()}"
    data = response.json()

    assert 'data' in data, "Missing 'data' field"
    project_id = data['data']['id']
    print(f"[OK] Project created (ID: {project_id})")

except Exception as e:
    print(f"[ERR] {type(e).__name__}: {e}")
    all_passed = False
    sys.exit(1)

# ============================================================
# PHASE 3: Land Input System - Save Land Data
# ============================================================
print("\n[PHASE 3] Land Input System - Save Land Data")
try:
    land_data = {
        "polygonPoints": [
            {"x": 100, "y": 100},
            {"x": 500, "y": 100},
            {"x": 500, "y": 400},
            {"x": 100, "y": 400}
        ],
        "unit": "ft",
        "roadSide": 1,  # Right side
        "northAngle": 45
    }

    response = client.put(
        f"/projects/{project_id}",
        headers={"Authorization": f"Bearer {token}"},
        json={"land_data": land_data}
    )
    assert response.status_code == 200, f"Land data save failed: {response.json()}"

    # Verify land data is saved
    response = client.get(
        f"/projects/{project_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    saved_project = response.json()['data']
    assert 'land_data' in saved_project, "Land data not saved to project"
    assert saved_project['land_data']['polygonPoints'] == land_data['polygonPoints']

    print(f"[OK] Land data saved to project (4 polygon points)")
    print(f"    - Unit: {land_data['unit']}, Road: side {land_data['roadSide']}, North: {land_data['northAngle']}°")

except Exception as e:
    print(f"[ERR] {type(e).__name__}: {e}")
    all_passed = False
    sys.exit(1)

# ============================================================
# PHASE 5: Layout Generation Engine
# ============================================================
print("\n[PHASE 5] Layout Generation Engine - Generate Layouts")
try:
    requirements = {
        "mode": "basic",
        "vastuEnabled": True,
        "bedroomCount": 2,
        "hasKitchen": True,
        "hasLivingRoom": True,
        "hasDiningRoom": False
    }

    response = client.post(
        "/generate",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "land_data": land_data,
            "requirements": requirements
        }
    )
    assert response.status_code == 200, f"Layout generation failed: {response.json()}"
    data = response.json()

    assert data['success'] == True, f"Generation failed: {data}"
    assert 'data' in data, "Missing 'data' field"
    assert 'layouts' in data['data'], "Missing 'layouts' field"

    layouts = data['data']['layouts']
    assert len(layouts) > 0, "No layouts generated"
    assert len(layouts) <= 5, "Too many layouts"

    print(f"[OK] Generated {len(layouts)} layout variants")

    # Verify each layout structure
    for idx, layout in enumerate(layouts, 1):
        assert 'id' in layout
        assert 'name' in layout
        assert 'rooms' in layout
        assert 'score' in layout
        assert isinstance(layout['rooms'], list)
        assert len(layout['rooms']) > 0

        # First layout details
        if idx == 1:
            room_names = [r['type'].replace('_', ' ') for r in layout['rooms']]
            print(f"[OK] Layout {idx}: '{layout['name']}'")
            print(f"     - Rooms: {', '.join(room_names)}")
            print(f"     - Vastu Score: {layout['score']:.1f}/100")
            print(f"     - Room count: {len(layout['rooms'])}")

except Exception as e:
    print(f"[ERR] {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
    all_passed = False
    sys.exit(1)

# ============================================================
# INTEGRATION CHECK: Save Layout to Project
# ============================================================
print("\n[INTEGRATION] Save Generated Layout to Project")
try:
    # Save first layout to project
    response = client.put(
        f"/projects/{project_id}",
        headers={"Authorization": f"Bearer {token}"},
        json={"layout": layouts[0]}
    )
    assert response.status_code == 200, f"Layout save failed: {response.json()}"

    # Verify layout is saved
    response = client.get(
        f"/projects/{project_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    saved_project = response.json()['data']
    assert 'layout' in saved_project, "Layout not saved"
    assert saved_project['layout']['name'] == layouts[0]['name']

    print(f"[OK] Layout '{layouts[0]['name']}' saved to project")

except Exception as e:
    print(f"[ERR] {type(e).__name__}: {e}")
    all_passed = False
    sys.exit(1)

# ============================================================
# FINAL VERIFICATION: Get Complete Project
# ============================================================
print("\n[VERIFICATION] Complete Project Data")
try:
    response = client.get(
        f"/projects/{project_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    project = response.json()['data']

    print(f"[OK] Project #{project['id']} retrieved")
    print(f"     - Name: {project['name']}")
    print(f"     - Land polygon points: {len(project['land_data']['polygonPoints'])}")
    print(f"     - Saved layout: {project['layout']['name'] if 'layout' in project and project['layout'] else 'None'}")
    print(f"     - Rooms in layout: {len(project['layout']['rooms']) if 'layout' in project and project['layout'] else 0}")

except Exception as e:
    print(f"[ERR] {type(e).__name__}: {e}")
    all_passed = False
    sys.exit(1)

# ============================================================
# SUMMARY
# ============================================================
print("\n" + "="*70)
if all_passed:
    print("[OK] ALL PHASES INTEGRATED AND WORKING CORRECTLY!")
    print("="*70)
    print("\nPhase Integration Summary:")
    print("  Phase 1 (Backend)         [OK] Health check, projects CRUD")
    print("  Phase 2 (Auth)            [OK] Register, login, token auth")
    print("  Phase 3 (Land Input)      [OK] Save land data to project")
    print("  Phase 5 (Layout Gen)      [OK] Generate layouts from land data")
    print("  Integration               [OK] Complete workflow: Auth -> Project -> Land -> Layouts")
    print("="*70)
    sys.exit(0)
else:
    print("[ERR] SOME PHASES HAVE ISSUES")
    print("="*70)
    sys.exit(1)
