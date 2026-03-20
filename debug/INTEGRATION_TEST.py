#!/usr/bin/env python3
"""
Comprehensive integration test for Phases 1, 2, and 3.
Tests the complete flow: Auth → Project Creation → Land Data Storage
"""

import requests
import json
import time
import subprocess
import os
import signal
import sys

# Configuration
API_BASE_URL = "http://localhost:8000"
TEST_EMAIL = "integration-test@example.com"
TEST_PASSWORD = "TestPassword123!"

class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*70}")
    print(f"  {text}")
    print(f"{'='*70}{Colors.END}\n")

def print_success(text):
    print(f"{Colors.GREEN}[OK] {text}{Colors.END}")

def print_error(text):
    print(f"{Colors.RED}[ERR] {text}{Colors.END}")

def print_info(text):
    print(f"{Colors.CYAN}[*] {text}{Colors.END}")

def print_test(text):
    print(f"{Colors.BLUE}[>] {text}{Colors.END}")

def wait_for_api(max_attempts=15):
    """Wait for API to be ready."""
    print_info("Waiting for API to be ready...")
    for attempt in range(max_attempts):
        try:
            response = requests.get(f"{API_BASE_URL}/health", timeout=2)
            if response.status_code == 200:
                print_success("API is ready!")
                return True
        except requests.exceptions.RequestException:
            pass

        if attempt < max_attempts - 1:
            time.sleep(1)

    print_error("API failed to start")
    return False

def test_phase_1_health():
    """Test Phase 1: Backend Health Check"""
    print_header("PHASE 1: Backend Scaffolding - Health Check")

    print_test("Testing GET /health endpoint")
    try:
        response = requests.get(f"{API_BASE_URL}/health")
        data = response.json()

        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert data["status"] == "ok", "Status should be 'ok'"

        print_success(f"Health check passed: {json.dumps(data, indent=2)}")
        return True
    except Exception as e:
        print_error(f"Health check failed: {str(e)}")
        return False

def test_phase_2_auth():
    """Test Phase 2: Authentication System"""
    print_header("PHASE 2: Authentication System")

    # Clear any existing test user
    print_test("Clearing test user from database (if exists)...")
    try:
        # Try to login with test credentials to verify user doesn't exist yet
        response = requests.post(
            f"{API_BASE_URL}/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        if response.status_code == 200:
            print_info("Test user already exists, proceeding with login test")
    except:
        pass

    # Test 1: User Registration
    print_test("Testing POST /auth/register")
    try:
        response = requests.post(
            f"{API_BASE_URL}/auth/register",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )

        data = response.json()
        assert response.status_code == 201, f"Expected 201, got {response.status_code}: {data}"
        assert data["success"] == True, "Response should indicate success"
        assert "data" in data, "Response should contain data"
        assert "user" in data["data"], "Response should contain user"
        assert "token" in data["data"], "Response should contain token"

        register_token = data["data"]["token"]["access_token"]
        user_id = data["data"]["user"]["id"]
        user_email = data["data"]["user"]["email"]

        print_success(f"User registered: {user_email} (ID: {user_id})")
        print_success(f"JWT token issued: {register_token[:30]}...")
        return True, register_token, user_id

    except Exception as e:
        print_error(f"Registration failed: {str(e)}")
        return False, None, None

def test_phase_2_auth_me(token):
    """Test authenticated endpoint"""
    print_test("Testing GET /auth/me (with Bearer token)")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(
            f"{API_BASE_URL}/auth/me",
            headers=headers
        )

        data = response.json()
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {data}"
        assert data["success"] == True, "Response should indicate success"
        assert "data" in data, "Response should contain data"
        assert data["data"]["email"] == TEST_EMAIL, "Email should match"

        print_success(f"Auth /me endpoint works: User {data['data']['email']} verified")
        return True

    except Exception as e:
        print_error(f"Auth /me test failed: {str(e)}")
        return False

def test_phase_1_projects(token, user_id):
    """Test Phase 1: Project CRUD Operations"""
    print_header("PHASE 1: Backend Scaffolding - Project CRUD")

    # Test 1: Create Project
    print_test("Testing POST /projects (create project)")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.post(
            f"{API_BASE_URL}/projects",
            json={"name": "Test Plot", "description": "Integration test plot"},
            headers=headers
        )

        data = response.json()
        assert response.status_code == 201, f"Expected 201, got {response.status_code}: {data}"
        assert data["success"] == True, "Response should indicate success"
        assert "data" in data, "Response should contain data"

        project_id = data["data"]["id"]
        print_success(f"Project created: ID {project_id}, Name: {data['data']['name']}")
        return True, project_id

    except Exception as e:
        print_error(f"Project creation failed: {str(e)}")
        return False, None

def test_phase_1_get_project(token, project_id):
    """Test getting a project"""
    print_test(f"Testing GET /projects/{project_id}")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(
            f"{API_BASE_URL}/projects/{project_id}",
            headers=headers
        )

        data = response.json()
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {data}"
        assert data["data"]["id"] == project_id, "Project ID should match"

        print_success(f"Project retrieved: {data['data']['name']}")
        return True

    except Exception as e:
        print_error(f"Get project failed: {str(e)}")
        return False

def test_phase_3_land_data(token, project_id):
    """Test Phase 3: Land Data Storage"""
    print_header("PHASE 3: Land Input System - Data Storage")

    # Prepare sample land data (as would be sent from the React frontend)
    land_data = {
        "polygonPoints": [
            {"x": 100, "y": 100},
            {"x": 300, "y": 100},
            {"x": 300, "y": 200},
            {"x": 100, "y": 200}
        ],
        "roadSide": 0,  # Front (south)
        "northAngle": 0,  # North is up
        "unit": "ft"
    }

    print_test(f"Testing PUT /projects/{project_id} with land_data")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.put(
            f"{API_BASE_URL}/projects/{project_id}",
            json={"land_data": land_data},
            headers=headers
        )

        data = response.json()
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {data}"
        assert data["data"]["land_data"] is not None, "Project should have land_data"

        stored_data = data["data"]["land_data"]
        print_success(f"Land data saved successfully")
        print_success(f"  Polygon points: {len(stored_data['polygonPoints'])} points")
        print_success(f"  Road side: {stored_data['roadSide']}")
        print_success(f"  North angle: {stored_data['northAngle']}°")
        print_success(f"  Unit: {stored_data['unit']}")
        return True

    except Exception as e:
        print_error(f"Land data save failed: {str(e)}")
        return False

def test_phase_2_auth_login():
    """Test Phase 2: Login with existing user"""
    print_header("PHASE 2: Authentication System - Login")

    print_test("Testing POST /auth/login with existing user")
    try:
        response = requests.post(
            f"{API_BASE_URL}/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )

        data = response.json()
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {data}"
        assert data["success"] == True, "Response should indicate success"

        login_token = data["data"]["token"]["access_token"]
        print_success(f"Login successful: {data['data']['user']['email']}")
        print_success(f"JWT token issued: {login_token[:30]}...")
        return True, login_token

    except Exception as e:
        print_error(f"Login failed: {str(e)}")
        return False, None

def test_phase_1_list_projects(token):
    """Test listing projects"""
    print_test("Testing GET /projects (list projects)")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(
            f"{API_BASE_URL}/projects",
            headers=headers
        )

        data = response.json()
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {data}"

        projects = data["data"]
        print_success(f"Projects retrieved: {len(projects)} project(s)")
        for proj in projects:
            print_info(f"  - {proj['name']} (ID: {proj['id']})")
        return True

    except Exception as e:
        print_error(f"List projects failed: {str(e)}")
        return False

def main():
    """Run full integration test suite"""

    print(f"\n{Colors.HEADER}{Colors.BOLD}")
    print("=" * 70)
    print("  ArchGen AI - PHASES 1/2/3 INTEGRATION TEST")
    print("=" * 70)
    print(f"{Colors.END}\n")

    # Start backend
    print_info("Starting backend server...")
    backend_process = None
    try:
        backend_path = os.path.join(os.path.dirname(__file__), "backend")
        backend_process = subprocess.Popen(
            ["python", "-m", "uvicorn", "app:app", "--host", "127.0.0.1", "--port", "8000"],
            cwd=backend_path,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        print_success("Backend process started (PID: {})".format(backend_process.pid))
    except Exception as e:
        print_error(f"Failed to start backend: {str(e)}")
        return

    # Wait for API
    if not wait_for_api():
        if backend_process:
            backend_process.terminate()
        return

    # Run tests
    results = {}
    try:
        # Phase 1: Health
        results["Phase 1 - Health"] = test_phase_1_health()

        # Phase 2: Registration
        success, token, user_id = test_phase_2_auth()
        results["Phase 2 - Register"] = success

        if token:
            # Phase 2: Auth /me
            results["Phase 2 - Auth /me"] = test_phase_2_auth_me(token)

            # Phase 1: Create Project
            success, project_id = test_phase_1_projects(token, user_id)
            results["Phase 1 - Create Project"] = success

            if project_id:
                # Phase 1: Get Project
                results["Phase 1 - Get Project"] = test_phase_1_get_project(token, project_id)

                # Phase 3: Save Land Data
                results["Phase 3 - Land Data"] = test_phase_3_land_data(token, project_id)

            # Phase 1: List Projects
            results["Phase 1 - List Projects"] = test_phase_1_list_projects(token)

            # Phase 2: Login
            success, new_token = test_phase_2_auth_login()
            results["Phase 2 - Login"] = success

    finally:
        # Stop backend
        if backend_process:
            print_info("Stopping backend server...")
            backend_process.terminate()
            try:
                backend_process.wait(timeout=5)
                print_success("Backend stopped gracefully")
            except subprocess.TimeoutExpired:
                backend_process.kill()
                print_info("Backend force-killed")

    # Print summary
    print_header("TEST SUMMARY")

    passed = sum(1 for v in results.values() if v)
    total = len(results)

    for test_name, result in results.items():
        if result:
            print_success(test_name)
        else:
            print_error(test_name)

    print(f"\n{Colors.BOLD}Total: {passed}/{total} tests passed{Colors.END}\n")

    if passed == total:
        print(f"\n{Colors.GREEN}{Colors.BOLD}[OK] All phases are connected and running correctly!{Colors.END}\n")
    else:
        print(f"{Colors.RED}{Colors.BOLD}[ERR] Some tests failed{Colors.END}\n")

if __name__ == "__main__":
    main()
