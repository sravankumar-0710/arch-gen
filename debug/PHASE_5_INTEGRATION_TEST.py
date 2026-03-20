#!/usr/bin/env python3
# filepath: PHASE_5_INTEGRATION_TEST.py
# Purpose: Phase 5 Integration Tests - Layout Generation

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))

from fastapi.testclient import TestClient
from app import app
from database import init_db
import json

print("="*60)
print("PHASE 5: LAYOUT GENERATION ENGINE - INTEGRATION TESTS")
print("="*60)

# Initialize database
print("\n[*] Initializing database...")
init_db()
print("[OK] Database initialized")

client = TestClient(app)
all_passed = True

# Use unique email for each run
import time
unique_email = f"phase5-test-{int(time.time())}@test.com"

# TEST 1: Health check
print("\n[TEST 1] Health Check")
try:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()['status'] == 'ok'
    print("[OK] Health check passed")
except Exception as e:
    print(f"[ERR] {e}")
    all_passed = False

# TEST 2: Register user
print("\n[TEST 2] User Registration")
try:
    response = client.post(
        "/auth/register",
        json={"email": unique_email, "password": "testpass123"}
    )
    assert response.status_code in [200, 201, 409]  # 409 if already exists
    data = response.json()

    if response.status_code == 409:
        # User exists, login instead
        response = client.post(
            "/auth/login",
            json={"email": unique_email, "password": "testpass123"}
        )
        assert response.status_code == 200

    assert 'data' in data
    assert 'token' in data['data']
    token = data['data']['token']['access_token']
    print(f"[OK] User registered/logged in")
except Exception as e:
    print(f"[ERR] {e}")
    all_passed = False
    sys.exit(1)

# TEST 3: Generate Layout
print("\n[TEST 3] Generate Layouts")
try:
    response = client.post(
        "/generate",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "land_data": {
                "polygonPoints": [
                    {"x": 100, "y": 100},
                    {"x": 500, "y": 100},
                    {"x": 500, "y": 400},
                    {"x": 100, "y": 400}
                ],
                "unit": "ft",
                "roadSide": 0,
                "northAngle": 45
            },
            "requirements": {
                "mode": "basic",
                "vastuEnabled": True,
                "bedroomCount": 2,
                "hasKitchen": True,
                "hasLivingRoom": True,
                "hasDiningRoom": False
            }
        }
    )

    assert response.status_code == 200, f"Status: {response.status_code}, Body: {response.json()}"
    data = response.json()

    assert data.get('success') == True, f"Success flag: {data}"
    assert 'data' in data,  "Missing data field"
    assert 'layouts' in data['data'], "Missing layouts field"

    layouts = data['data']['layouts']
    assert len(layouts) > 0, "No layouts generated"

    # Verify layout structure
    for layout in layouts:
        assert 'id' in layout
        assert 'name' in layout
        assert 'rooms' in layout
        assert 'score' in layout
        assert isinstance(layout['rooms'], list)

        # Verify rooms have required fields
        if layout['rooms']:
            room = layout['rooms'][0]
            assert 'id' in room
            assert 'type' in room
            assert 'area' in room
            assert 'centroid' in room

    print(f"[OK] Generated {len(layouts)} layout variants")
    print(f"[OK] Layout 1: '{layouts[0]['name']}' with {len(layouts[0]['rooms'])} rooms")
    print(f"[OK] Rooms: {', '.join([r['type'].replace('_', ' ') for r in layouts[0]['rooms']])}")

except AssertionError as e:
    print(f"[ERR] Assertion failed: {e}")
    all_passed = False
except Exception as e:
    print(f"[ERR] {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
    all_passed = False

# Summary
print("\n" + "="*60)
if all_passed:
    print("[OK] ALL TESTS PASSED - Phase 5 Complete!")
    print("="*60)
    sys.exit(0)
else:
    print("[ERR] SOME TESTS FAILED")
    print("="*60)
    sys.exit(1)
