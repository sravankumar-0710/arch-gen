#!/usr/bin/env python3
# filepath: PHASE_5_TEST.py
# Purpose: Comprehensive Phase 5 integration tests for layout generation

import subprocess
import time
import requests
import json
import sys
import random
import string

BASE_URL = "http://localhost:8000"
BACKEND_PROCESS = None


def generate_test_email():
    """Generate a unique test email."""
    random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"phase5-test-{random_suffix}@example.com"


def start_backend():
    """Start the backend server."""
    global BACKEND_PROCESS
    print("[*] Starting backend server...")
    # Run uvicorn from the backend directory
    BACKEND_PROCESS = subprocess.Popen(
        ["python", "-m", "uvicorn", "app:app", "--host", "127.0.0.1", "--port", "8000"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd="backend"
    )
    # Wait for backend to be ready
    for i in range(20):
        try:
            response = requests.get(f"{BASE_URL}/health", timeout=1)
            if response.status_code == 200:
                print("[OK] Backend started and ready (PID %d)" % BACKEND_PROCESS.pid)
                return
        except:
            pass
        time.sleep(0.5)

    print("[OK] Backend started (PID %d) - may not be ready yet" % BACKEND_PROCESS.pid)


def stop_backend():
    """Stop the backend server."""
    if BACKEND_PROCESS:
        print("[*] Stopping backend server...")
        BACKEND_PROCESS.terminate()
        BACKEND_PROCESS.wait(timeout=5)
        print("[OK] Backend stopped")


def test_health():
    """Test 1: Health check."""
    print("\n[TEST 1] Phase 1 Health Check")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'ok'
        print("[OK] Health check passed")
        return True
    except Exception as e:
        print(f"[ERR] Health check failed: {e}")
        return False


def test_register_user():
    """Test 2: User registration."""
    print("\n[TEST 2] Phase 2 User Registration")
    try:
        email = generate_test_email()
        response = requests.post(
            f"{BASE_URL}/auth/register",
            json={"email": email, "password": "test123456"},
            timeout=5
        )
        assert response.status_code in [200, 201], f"Status {response.status_code}: {response.text}"
        data = response.json()
        assert data.get('success'), f"Success flag missing: {data}"
        assert 'data' in data, f"Data field missing: {data}"

        # Handle response structure: data contains user and token
        result_data = data['data']
        assert 'user' in result_data, f"User missing in data: {result_data}"
        assert 'token' in result_data, f"Token missing in data: {result_data}"

        user_id = result_data['user']['id']
        token = result_data['token']['access_token']
        print(f"[OK] User registered (ID: {user_id}, Email: {email})")
        return token, user_id
    except Exception as e:
        print(f"[ERR] Registration failed: {e}")
        return None, None


def test_create_project(token):
    """Test 3: Create project with land data."""
    print("\n[TEST 3] Phase 4 Create Project with Land Data")
    try:
        # Create project
        response = requests.post(
            f"{BASE_URL}/projects",
            headers={"Authorization": f"Bearer {token}"},
            json={"name": "Phase 5 Test Project", "description": "Layout generation test"},
            timeout=5
        )
        assert response.status_code in [200, 201], f"Create failed - Status {response.status_code}: {response.text}"
        result = response.json()
        # Response structure: {success, data: {id, ...}, message}
        project_data = result.get('data', {})
        project_id = project_data.get('id')
        assert project_id, f"No project ID in response: {result}"
        print(f"[OK] Project created (ID: {project_id})")

        # Save land data to project
        land_data = {
            "polygonPoints": [
                {"x": 100, "y": 100},
                {"x": 500, "y": 100},
                {"x": 500, "y": 400},
                {"x": 100, "y": 400}
            ],
            "unit": "ft",
            "roadSide": 0,
            "northAngle": 45
        }

        response = requests.put(
            f"{BASE_URL}/projects/{project_id}",
            headers={"Authorization": f"Bearer {token}"},
            json={"land_data": land_data},
            timeout=5
        )
        assert response.status_code == 200, f"Update failed - Status {response.status_code}: {response.text}"
        print("[OK] Land data saved to project")
        return project_id, land_data

    except Exception as e:
        print(f"[ERR] Project creation failed: {e}")
        return None, None


def test_generate_layout(token, land_data):
    """Test 4: Generate layouts from land data and requirements."""
    print("\n[TEST 4] Phase 5 Generate Layout")
    try:
        # Prepare requirements
        requirements = {
            "mode": "basic",
            "vastuEnabled": True,
            "bedroomCount": 2,
            "hasKitchen": True,
            "hasLivingRoom": True,
            "hasDiningRoom": False
        }

        # Call layout generation endpoint
        response = requests.post(
            f"{BASE_URL}/generate",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "land_data": land_data,
                "requirements": requirements
            },
            timeout=10
        )

        assert response.status_code == 200, f"Status: {response.status_code}, Body: {response.text}"
        data = response.json()

        assert data['success'] == True, f"Generation failed: {data}"
        assert 'data' in data
        assert 'layouts' in data['data']
        assert len(data['data']['layouts']) > 0, "No layouts generated"

        layouts = data['data']['layouts']
        print(f"[OK] Generated {len(layouts)} layout variants")

        # Verify first layout structure
        first_layout = layouts[0]
        assert 'id' in first_layout
        assert 'name' in first_layout
        assert 'rooms' in first_layout
        assert 'score' in first_layout
        assert len(first_layout['rooms']) > 0

        print(f"[OK] Layout 1: '{first_layout['name']}' - Score: {first_layout['score']:.1f}/100")
        print(f"[OK] Rooms: {', '.join([r['type'].replace('_', ' ') for r in first_layout['rooms']])}")

        return layouts

    except Exception as e:
        print(f"[ERR] Layout generation failed: {e}")
        import traceback
        traceback.print_exc()
        return None


def test_save_layout(token, project_id, layout):
    """Test 5: Save selected layout to project."""
    print("\n[TEST 5] Phase 5 Save Generated Layout")
    try:
        response = requests.put(
            f"{BASE_URL}/projects/{project_id}",
            headers={"Authorization": f"Bearer {token}"},
            json={"layout": layout},
            timeout=5
        )
        assert response.status_code == 200
        print(f"[OK] Layout saved to project")
        return True

    except Exception as e:
        print(f"[ERR] Save layout failed: {e}")
        return False


def test_verify_project_with_layout(token, project_id):
    """Test 6: Verify project has both land data and layout."""
    print("\n[TEST 6] Phase 5 Verify Project State")
    try:
        response = requests.get(
            f"{BASE_URL}/projects/{project_id}",
            headers={"Authorization": f"Bearer {token}"},
            timeout=5
        )
        assert response.status_code == 200
        project = response.json()

        has_land = project.get('land_data') is not None
        has_layout = project.get('layout') is not None

        assert has_land, "Land data missing"
        assert has_layout, "Layout missing"

        print(f"[OK] Project has land data: {has_land}")
        print(f"[OK] Project has layout: {has_layout}")

        if has_layout and 'score' in project['layout']:
            print(f"[OK] Layout Vastu score: {project['layout']['score']:.1f}/100")

        return True

    except Exception as e:
        print(f"[ERR] Verification failed: {e}")
        return False


def test_list_projects(token):
    """Test 7: List projects with layouts."""
    print("\n[TEST 7] Phase 4 List Projects")
    try:
        response = requests.get(
            f"{BASE_URL}/projects",
            headers={"Authorization": f"Bearer {token}"},
            timeout=5
        )
        assert response.status_code == 200
        projects = response.json()
        assert len(projects) > 0, "No projects in list"
        print(f"[OK] Listed {len(projects)} projects")
        return True

    except Exception as e:
        print(f"[ERR] List projects failed: {e}")
        return False


def test_advanced_requirements(token, land_data):
    """Test 8: Generate layout with advanced room requirements."""
    print("\n[TEST 8] Phase 5 Advanced Requirements")
    try:
        # Advanced mode with custom rooms
        requirements = {
            "mode": "advanced",
            "vastuEnabled": True,
            "rooms": [
                {"type": "master_bedroom", "minArea": 140, "maxArea": 250},
                {"type": "bedroom", "minArea": 90, "maxArea": 160},
                {"type": "kitchen", "minArea": 80, "maxArea": 150},
                {"type": "living_room", "minArea": 150, "maxArea": 300}
            ]
        }

        response = requests.post(
            f"{BASE_URL}/generate",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "land_data": land_data,
                "requirements": requirements
            },
            timeout=10
        )

        assert response.status_code == 200
        data = response.json()
        assert data['success'] == True
        assert len(data['data']['layouts']) > 0

        layouts = data['data']['layouts']
        print(f"[OK] Generated {len(layouts)} layouts with advanced requirements")
        return True

    except Exception as e:
        print(f"[ERR] Advanced generation failed: {e}")
        return False


def test_vastu_disabled(token, land_data):
    """Test 9: Generate layout without Vastu optimization."""
    print("\n[TEST 9] Phase 5 Vastu Disabled")
    try:
        requirements = {
            "mode": "basic",
            "vastuEnabled": False,
            "bedroomCount": 2,
            "hasKitchen": True,
            "hasLivingRoom": True
        }

        response = requests.post(
            f"{BASE_URL}/generate",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "land_data": land_data,
                "requirements": requirements
            },
            timeout=10
        )

        assert response.status_code == 200
        data = response.json()
        assert data['success'] == True

        layouts = data['data']['layouts']
        print(f"[OK] Generated layouts without Vastu optimization")
        print(f"[OK] First layout score: {layouts[0]['score']:.1f}/100 (neutral base)")
        return True

    except Exception as e:
        print(f"[ERR] Vastu-disabled generation failed: {e}")
        return False


def main():
    """Run all Phase 5 tests."""
    print("=" * 60)
    print("PHASE 5: LAYOUT GENERATION ENGINE - INTEGRATION TESTS")
    print("=" * 60)

    start_backend()

    try:
        # Run tests sequentially
        results = []

        # Test 1: Health
        results.append(("Phase 1 Health Check", test_health()))

        # Test 2: Register user
        token, user_id = test_register_user()
        results.append(("Phase 2 User Registration", token is not None))

        if not token:
            print("\n[ERR] Cannot continue without user token")
            return False

        # Test 3: Create project with land data
        project_id, land_data = test_create_project(token)
        results.append(("Phase 4 Create Project + Land Data", project_id is not None))

        if not project_id:
            print("\n[ERR] Cannot continue without project")
            return False

        # Test 4: Generate layouts with basic requirements
        layouts = test_generate_layout(token, land_data)
        results.append(("Phase 5 Generate Layout (Basic)", layouts is not None and len(layouts) > 0))

        if not layouts:
            print("\n[ERR] Cannot continue without generated layouts")
            return False

        # Test 5: Save layout
        saved = test_save_layout(token, project_id, layouts[0])
        results.append(("Phase 5 Save Generated Layout", saved))

        # Test 6: Verify project state
        verified = test_verify_project_with_layout(token, project_id)
        results.append(("Phase 5 Verify Project State", verified))

        # Test 7: List projects
        listed = test_list_projects(token)
        results.append(("Phase 4 List Projects", listed))

        # Test 8: Advanced requirements
        advanced = test_advanced_requirements(token, land_data)
        results.append(("Phase 5 Advanced Requirements", advanced))

        # Test 9: Vastu disabled
        vastu_disabled = test_vastu_disabled(token, land_data)
        results.append(("Phase 5 Vastu Disabled", vastu_disabled))

        # Print summary
        print("\n" + "=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)

        passed = sum(1 for _, result in results if result)
        total = len(results)

        for test_name, result in results:
            status = "[OK]" if result else "[ERR]"
            print(f"{status} {test_name}")

        print(f"\nTotal: {passed}/{total} PASSED ({int(100*passed/total)}%)")

        if passed == total:
            print("\n[OK] ALL TESTS PASSED - Phase 5 implementation verified!")
            return True
        else:
            print(f"\n[ERR] {total - passed} test(s) failed")
            return False

    finally:
        stop_backend()


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
