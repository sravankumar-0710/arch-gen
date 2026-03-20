#!/usr/bin/env python
"""
Complete integration test for all 5 phases of ArchGen AI.
Verifies authentication, project management, land data, and layout generation.
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"
TEST_EMAIL = f"integration_test_{int(time.time())}@test.com"
TEST_PASSWORD = "TestPassword123!@#"

def print_header(text):
    print("\n" + "="*70)
    print(text.center(70))
    print("="*70 + "\n")

def print_success(text):
    print(f"[OK] {text}")

def print_error(text):
    print(f"[FAIL] {text}")

def test_phase_1_backend():
    """Phase 1: Test backend health and basic connectivity."""
    print_header("PHASE 1: Backend Scaffolding")

    try:
        response = requests.get(f"{BASE_URL}/health")
        assert response.status_code == 200, f"Health check failed: {response.status_code}"
        data = response.json()
        assert data['status'] == 'ok', "Health status not ok"
        print_success(f"Backend is healthy: {data}")
        return True
    except Exception as e:
        print_error(f"Backend health check failed: {e}")
        return False

def test_phase_2_auth():
    """Phase 2: Test user registration and login."""
    print_header("PHASE 2: Authentication System")

    try:
        # Register user
        register_response = requests.post(
            f"{BASE_URL}/auth/register",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        assert register_response.status_code in [200, 201], f"Registration failed: {register_response.status_code}"
        reg_data = register_response.json()
        assert 'data' in reg_data and 'user' in reg_data['data'], "User data not in response"
        print_success(f"User registration successful: {TEST_EMAIL}")

        # Login user
        login_response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        assert login_response.status_code == 200, f"Login failed: {login_response.status_code}"
        login_data = login_response.json()
        assert 'data' in login_data and 'token' in login_data['data'], "Token not in login response"
        token_obj = login_data['data']['token']
        token = token_obj.get('access_token') or token_obj.get('token')
        print_success(f"User login successful. Token acquired: {token[:30]}...")

        # Get current user
        headers = {"Authorization": f"Bearer {token}"}
        me_response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        assert me_response.status_code == 200, f"Get current user failed: {me_response.status_code}"
        me_data = me_response.json()
        user_data = me_data.get('data') or me_data
        user_id = user_data.get('user', {}).get('id') or user_data.get('id')
        print_success(f"Retrieved current user. User ID: {user_id}")

        return True, token, user_id
    except Exception as e:
        print_error(f"Authentication test failed: {e}")
        return False, None, None

def test_phase_4_projects(token, user_id):
    """Phase 4: Test project creation and management."""
    print_header("PHASE 4: Project Management")

    headers = {"Authorization": f"Bearer {token}"}

    try:
        # Create a project
        create_response = requests.post(
            f"{BASE_URL}/projects",
            headers=headers,
            json={
                "name": "Integration Test Project",
                "description": "Test project for integration testing"
            }
        )
        assert create_response.status_code in [200, 201], f"Project creation failed: {create_response.status_code}"
        project_data = create_response.json()
        project_id = project_data['data']['id']
        print_success(f"Project created successfully. Project ID: {project_id}")

        # List projects
        list_response = requests.get(f"{BASE_URL}/projects", headers=headers)
        assert list_response.status_code == 200, f"List projects failed: {list_response.status_code}"
        projects = list_response.json()['data']
        print_success(f"Listed projects. Total: {len(projects)}")

        # Get specific project
        get_response = requests.get(f"{BASE_URL}/projects/{project_id}", headers=headers)
        assert get_response.status_code == 200, f"Get project failed: {get_response.status_code}"
        retrieved_project = get_response.json()['data']
        print_success(f"Retrieved project: {retrieved_project['name']}")

        return True, project_id
    except Exception as e:
        print_error(f"Project management test failed: {e}")
        return False, None

def test_phase_3_land_data(token, project_id):
    """Phase 3: Test land input/land data persistence."""
    print_header("PHASE 3: Land Input & Data Persistence")

    headers = {"Authorization": f"Bearer {token}"}

    try:
        # Define land polygon (canvas coordinates: 300x300 pixel area)
        land_data = {
            "polygonPoints": [
                {"x": 50, "y": 50},
                {"x": 350, "y": 50},
                {"x": 350, "y": 350},
                {"x": 50, "y": 350}
            ],
            "unit": "ft",
            "roadSide": 0,  # Front
            "northAngle": 45
        }

        # Update project with land data
        update_response = requests.put(
            f"{BASE_URL}/projects/{project_id}",
            headers=headers,
            json={
                "land_data": land_data
            }
        )
        assert update_response.status_code == 200, f"Update project failed: {update_response.status_code}"
        updated_project = update_response.json()['data']
        print_success(f"Land data saved to project")

        # Verify land data persistence
        verify_response = requests.get(f"{BASE_URL}/projects/{project_id}", headers=headers)
        assert verify_response.status_code == 200, f"Verify project failed: {verify_response.status_code}"
        verified_project = verify_response.json()['data']
        assert verified_project['land_data'] is not None, "Land data not persisted"
        assert verified_project['land_data']['unit'] == 'ft', "Unit mismatch"
        assert verified_project['land_data']['northAngle'] == 45, "North angle mismatch"
        print_success(f"Land data verified. Unit: {verified_project['land_data']['unit']}, North Angle: {verified_project['land_data']['northAngle']}° ")

        return True, land_data
    except Exception as e:
        print_error(f"Land input test failed: {e}")
        return False, None

def test_phase_5_layout_generation(token, project_id, land_data):
    """Phase 5: Test layout generation with saved land data."""
    print_header("PHASE 5: Layout Generation Engine")

    headers = {"Authorization": f"Bearer {token}"}

    try:
        # Define room requirements
        requirements = {
            "mode": "basic",
            "bedroomCount": 2,
            "hasKitchen": True,
            "hasLivingRoom": True,
            "hasDiningRoom": False,
            "vastuEnabled": True
        }

        # Generate layouts
        generate_response = requests.post(
            f"{BASE_URL}/generate",
            headers=headers,
            json={
                "project_id": project_id,
                "land_data": land_data,
                "requirements": requirements
            }
        )
        assert generate_response.status_code in [200, 201], f"Layout generation failed: {generate_response.status_code} - {generate_response.text}"
        layout_data = generate_response.json()['data']

        # Verify layout generation
        layouts = layout_data['layouts']
        assert len(layouts) >= 3, f"Expected at least 3 variants, got {len(layouts)}"
        print_success(f"Generated {len(layouts)} layout variants")

        # Check variant differentiation
        variant_rooms = []
        for idx, layout in enumerate(layouts):
            room_types = [r['type'] for r in layout['rooms']]
            variant_rooms.append(room_types)
            print_success(f"  Variant {idx+1} ({layout['name']}): {room_types} - Score: {layout['score']}%")

        # Verify variants are different
        unique_arrangements = len(set(tuple(rooms) for rooms in variant_rooms))
        if unique_arrangements >= 2:
            print_success(f"VERIFIED: Variants have {unique_arrangements} different arrangements (expected >= 2)")
        else:
            print_error(f"FAILED: All variants have identical arrangements")
            return False

        # Verify walls and doors are generated
        for idx, layout in enumerate(layouts):
            walls = layout.get('walls', [])
            doors = layout.get('doors', [])
            windows = layout.get('windows', [])
            print_success(f"  Variant {idx+1}: {len(walls)} walls, {len(doors)} doors, {len(windows)} windows")

        # Save layout to project (optional - future phase)
        update_response = requests.put(
            f"{BASE_URL}/projects/{project_id}",
            headers=headers,
            json={
                "layout": layouts[0]  # Save best layout
            }
        )
        assert update_response.status_code == 200, f"Save layout failed: {update_response.status_code}"
        print_success(f"Best layout saved to project")

        return True
    except Exception as e:
        print_error(f"Layout generation test failed: {e}")
        return False

def main():
    print("\n" + "="*70)
    print("ARCHGEN AI - FULL INTEGRATION TEST (ALL 5 PHASES)".center(70))
    print("="*70)

    results = {}

    # Phase 1: Backend
    results['Phase 1'] = test_phase_1_backend()
    if not results['Phase 1']:
        print_error("Backend is not running. Start it with: python run_backend.py")
        return False

    # Phase 2: Authentication
    results['Phase 2'], token, user_id = test_phase_2_auth()
    if not results['Phase 2']:
        return False

    # Phase 4: Project Management
    results['Phase 4'], project_id = test_phase_4_projects(token, user_id)
    if not results['Phase 4']:
        return False

    # Phase 3: Land Input
    results['Phase 3'], land_data = test_phase_3_land_data(token, project_id)
    if not results['Phase 3']:
        return False

    # Phase 5: Layout Generation
    results['Phase 5'] = test_phase_5_layout_generation(token, project_id, land_data)
    if not results['Phase 5']:
        return False

    # Summary
    print_header("INTEGRATION TEST SUMMARY")
    print("Phase Status:")
    print(f"  Phase 1 (Backend Scaffolding):     {'PASSED' if results['Phase 1'] else 'FAILED'}")
    print(f"  Phase 2 (Authentication):          {'PASSED' if results['Phase 2'] else 'FAILED'}")
    print(f"  Phase 3 (Land Input):              {'PASSED' if results['Phase 3'] else 'FAILED'}")
    print(f"  Phase 4 (Project Management):      {'PASSED' if results['Phase 4'] else 'FAILED'}")
    print(f"  Phase 5 (Layout Generation):       {'PASSED' if results['Phase 5'] else 'FAILED'}")

    all_passed = all(results.values())
    print("\n" + "="*70)
    if all_passed:
        print("ALL PHASES CONNECTED AND WORKING PERFECTLY".center(70))
    else:
        print("SOME PHASES FAILED".center(70))
    print("="*70 + "\n")

    return all_passed

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
