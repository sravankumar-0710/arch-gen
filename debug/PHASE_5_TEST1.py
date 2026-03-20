#!/usr/bin/env python3
"""
Phase 5 Integration Test - Verify layout variants are different
Test that /generate endpoint produces 3+ different layout variants
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_phase5_layout_variants():
    """Test that layout generation produces different variants"""

    # 1. Register/Login to get token
    print("=" * 60)
    print("PHASE 5 LAYOUT GENERATION TEST")
    print("=" * 60)

    email = "test@phase5test.com"
    password = "password123"

    # Try to register
    print("\n[1] Registering test user...")
    reg_response = requests.post(f"{BASE_URL}/auth/register", json={
        "email": email,
        "password": password
    })
    print(f"    Status: {reg_response.status_code}")

    # Login to get token
    print("\n[2] Logging in...")
    login_response = requests.post(f"{BASE_URL}/auth/login", json={
        "email": email,
        "password": password
    })

    if login_response.status_code != 200:
        print(f"    ERROR: Login failed - {login_response.text}")
        return False

    token_data = login_response.json()
    token = token_data.get('data', {}).get('token', {}).get('access_token')
    print(f"    Token acquired: {token[:20] if token else 'FAILED'}...")

    # Land data
    land_data = {
        "polygonPoints": [
            {"x": 100, "y": 100},
            {"x": 400, "y": 100},
            {"x": 400, "y": 400},
            {"x": 100, "y": 400}
        ],
        "roadSide": 0,
        "northAngle": 0,
        "unit": "ft"
    }

    # Requirements
    requirements = {
        "bedrooms": 3,
        "bathrooms": 2,
        "kitchen": 1,
        "livingRoom": 1,
        "diningRoom": 1,
        "balcony": 1
    }

    payload = {
        "land_data": land_data,
        "requirements": requirements
    }

    print("\n[3] Sending POST /generate request...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/generate", json=payload, headers=headers)

    print(f"    Status: {response.status_code}")
    data = response.json()
    print(f"    Response: {json.dumps(data, indent=2)}")

    if not data.get('success'):
        print(f"    ERROR: {data.get('error', data.get('message', 'Unknown error'))}")
        return False

    layouts = data.get('data', {}).get('layouts', [])
    print(f"\n[4] SUCCESS: Generated {len(layouts)} layout variants")

    if len(layouts) < 3:
        print(f"    WARNING: Expected 3+ layouts, got {len(layouts)}")

    # Verify variants are different
    print("\n" + "=" * 60)
    print("VARIANT COMPARISON")
    print("=" * 60)

    all_different = True
    for i, layout in enumerate(layouts):
        print(f"\nLayout {i+1}: {layout.get('name', 'Unknown')}")
        print(f"  Score: {layout.get('score', 'N/A')}%")
        print(f"  Rooms: {len(layout.get('rooms', []))}")

        if layout.get('rooms'):
            room_types = [r.get('type', 'Unknown') for r in layout['rooms']]
            print(f"  Room types: {room_types}")

            # Compare with previous layouts
            if i > 0:
                prev_room_types = [r.get('type', 'Unknown') for r in layouts[i-1].get('rooms', [])]
                if room_types == prev_room_types:
                    print(f"  WARNING: Same arrangement as Layout {i}")
                    all_different = False
                else:
                    print(f"  DIFFERENT from Layout {i}")

    print("\n" + "=" * 60)
    if all_different and len(layouts) >= 3:
        print("SUCCESS: Phase 5 Complete - All variants are different!")
        return True
    else:
        print("INCOMPLETE: Some variants have identical arrangements or count < 3")
        return False

if __name__ == "__main__":
    success = test_phase5_layout_variants()
    exit(0 if success else 1)
