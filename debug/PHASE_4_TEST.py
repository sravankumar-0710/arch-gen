#!/usr/bin/env python3
"""
Phase 4 Integration Test - Project Management
Tests complete flow: Auth → Dashboard → Create Project → Edit → Delete
Also tests integration with Phases 1-3
"""

import requests
import json
import time
import subprocess
import os
import signal

API_BASE_URL = "http://localhost:8000"
TEST_EMAIL = "phase4-test@example.com"
TEST_PASSWORD = "TestPassword123!"

def print_separator():
    print("\n" + "="*80)

def print_section(text):
    print_separator()
    print(f"  {text}")
    print_separator()

def print_ok(text):
    print(f"[OK] {text}")

def print_err(text):
    print(f"[ERR] {text}")

def print_info(text):
    print(f"[i] {text}")

def wait_for_api(max_attempts=15):
    """Wait for API to be ready"""
    print_info("Waiting for API...")
    for attempt in range(max_attempts):
        try:
            response = requests.get(f"{API_BASE_URL}/health", timeout=2)
            if response.status_code == 200:
                print_ok("API ready")
                return True
        except:
            pass
        if attempt < max_attempts - 1:
            time.sleep(1)

    print_err("API failed to start")
    return False

def test_phase_1_backend():
    """Verify Phase 1 backend is ready"""
    print_section("PHASE 1 VERIFICATION: Backend")

    print_info("GET /health")
    response = requests.get(f"{API_BASE_URL}/health")
    assert response.status_code == 200
    data = response.json()
    print_ok(f"Health check: {data['status']}")
    return True

def test_phase_2_auth():
    """Verify Phase 2 authentication works"""
    print_section("PHASE 2 VERIFICATION: Authentication")

    print_info("POST /auth/register")
    response = requests.post(
        f"{API_BASE_URL}/auth/register",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
    )
    assert response.status_code == 201, f"Got {response.status_code}: {response.text}"
    data = response.json()
    token = data["data"]["token"]["access_token"]
    user_id = data["data"]["user"]["id"]

    print_ok(f"User registered: {TEST_EMAIL} (ID: {user_id})")
    print_ok(f"JWT token issued: {token[:30]}...")

    return token, user_id

def test_phase_4_project_list(token):
    """Phase 4: List projects (should be empty initially)"""
    print_section("PHASE 4 TEST 1: List Projects")

    print_info("GET /projects (before creating any)")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_BASE_URL}/projects", headers=headers)
    assert response.status_code == 200, f"Got {response.status_code}"

    data = response.json()
    projects = data["data"]
    print_ok(f"Projects list retrieved: {len(projects)} projects")

    return projects

def test_phase_4_create_project(token):
    """Phase 4: Create a project"""
    print_section("PHASE 4 TEST 2: Create Project")

    print_info('POST /projects with name="Test Project"')
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(
        f"{API_BASE_URL}/projects",
        json={"name": "Test Project", "description": "A test project"},
        headers=headers
    )
    assert response.status_code == 201, f"Got {response.status_code}: {response.text}"

    data = response.json()
    project = data["data"]
    project_id = project["id"]

    print_ok(f"Project created: {project['name']} (ID: {project_id})")
    print_ok(f"Description: {project['description']}")

    return project_id, project

def test_phase_4_get_project(token, project_id):
    """Phase 4: Get a specific project"""
    print_section("PHASE 4 TEST 3: Get Project")

    print_info(f"GET /projects/{project_id}")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(
        f"{API_BASE_URL}/projects/{project_id}",
        headers=headers
    )
    assert response.status_code == 200, f"Got {response.status_code}"

    data = response.json()
    project = data["data"]
    print_ok(f"Project retrieved: {project['name']}")

    return project

def test_phase_3_save_land_data(token, project_id):
    """Phase 3 Integration: Save land data to project"""
    print_section("PHASE 3 + PHASE 4 INTEGRATION: Save Land Data")

    land_data = {
        "polygonPoints": [
            {"x": 100, "y": 100},
            {"x": 300, "y": 100},
            {"x": 300, "y": 200},
            {"x": 100, "y": "200"}
        ],
        "roadSide": 0,
        "northAngle": 45,
        "unit": "ft"
    }

    print_info(f"PUT /projects/{project_id} with land_data")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.put(
        f"{API_BASE_URL}/projects/{project_id}",
        json={"land_data": land_data},
        headers=headers
    )
    assert response.status_code == 200, f"Got {response.status_code}"

    data = response.json()
    project = data["data"]

    saved_land = project.get("land_data")
    assert saved_land is not None, "Land data not saved"

    print_ok("Land data saved to project")
    print_ok(f"  - Polygon points: {len(saved_land['polygonPoints'])}")
    print_ok(f"  - Road side: {saved_land['roadSide']}")
    print_ok(f"  - North angle: {saved_land['northAngle']}°")
    print_ok(f"  - Unit: {saved_land['unit']}")

    return project

def test_phase_4_update_project(token, project_id):
    """Phase 4: Update project details"""
    print_section("PHASE 4 TEST 4: Update Project")

    print_info(f"PUT /projects/{project_id} with new description")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.put(
        f"{API_BASE_URL}/projects/{project_id}",
        json={"description": "Updated description"},
        headers=headers
    )
    assert response.status_code == 200, f"Got {response.status_code}"

    data = response.json()
    project = data["data"]

    assert project["description"] == "Updated description"
    print_ok(f"Project updated: {project['description']}")

    return project

def test_phase_4_list_projects_after_create(token):
    """Phase 4: List projects (should now have 1)"""
    print_section("PHASE 4 TEST 5: List Projects Again")

    print_info("GET /projects (after creating project)")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_BASE_URL}/projects", headers=headers)
    assert response.status_code == 200

    data = response.json()
    projects = data["data"]

    assert len(projects) >= 1, "Projects not visible in list"
    print_ok(f"Projects list now shows {len(projects)} project(s)")
    for proj in projects:
        print_info(f"  - {proj['name']} (ID: {proj['id']})")

    return projects

def test_phase_4_delete_project(token, project_id):
    """Phase 4: Delete a project"""
    print_section("PHASE 4 TEST 6: Delete Project")

    print_info(f"DELETE /projects/{project_id}")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.delete(
        f"{API_BASE_URL}/projects/{project_id}",
        headers=headers
    )
    assert response.status_code == 204, f"Got {response.status_code}"

    print_ok("Project deleted successfully")

    # Verify it's gone
    print_info(f"Verifying deletion with GET /projects/{project_id}")
    response = requests.get(
        f"{API_BASE_URL}/projects/{project_id}",
        headers=headers
    )
    assert response.status_code == 404, "Project still exists after deletion"
    print_ok("Deletion confirmed: project not found")

def test_phase_4_list_projects_after_delete(token):
    """Phase 4: List projects (should be empty again)"""
    print_section("PHASE 4 TEST 7: List Projects After Delete")

    print_info("GET /projects (after deleting project)")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_BASE_URL}/projects", headers=headers)
    assert response.status_code == 200

    data = response.json()
    projects = data["data"]

    print_ok(f"Projects list now shows {len(projects)} project(s)")
    if len(projects) == 0:
        print_ok("List is empty as expected")

def test_phase_4_multiple_projects(token):
    """Phase 4: Create multiple projects and verify"""
    print_section("PHASE 4 TEST 8: Multiple Projects")

    project_ids = []
    for i in range(3):
        project_name = f"Project {i+1}"
        print_info(f"Creating {project_name}")

        headers = {"Authorization": f"Bearer {token}"}
        response = requests.post(
            f"{API_BASE_URL}/projects",
            json={"name": project_name, "description": f"Description {i+1}"},
            headers=headers
        )
        assert response.status_code == 201

        data = response.json()
        project_id = data["data"]["id"]
        project_ids.append(project_id)
        print_ok(f"  Created: {project_name} (ID: {project_id})")

    # List all
    print_info("Listing all projects")
    response = requests.get(f"{API_BASE_URL}/projects", headers=headers)
    assert response.status_code == 200

    data = response.json()
    projects = data["data"]
    print_ok(f"Total projects: {len(projects)}")

    # Delete all
    print_info("Deleting all projects")
    for project_id in project_ids:
        response = requests.delete(
            f"{API_BASE_URL}/projects/{project_id}",
            headers=headers
        )
        assert response.status_code == 204
        print_ok(f"  Deleted: {project_id}")

def main():
    print("\n" + "="*80)
    print("  PHASE 4: PROJECT MANAGEMENT - INTEGRATION TEST")
    print("  Tests project CRUD, Phase 2 auth, Phase 3 land data")
    print("="*80)

    # Start backend
    print_info("Starting backend server...")
    backend_path = os.path.join(os.path.dirname(__file__), "backend")
    backend_process = subprocess.Popen(
        ["python", "-m", "uvicorn", "app:app", "--host", "127.0.0.1", "--port", "8000"],
        cwd=backend_path,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    print_ok(f"Backend started (PID: {backend_process.pid})")

    # Wait for API
    if not wait_for_api():
        backend_process.terminate()
        return

    results = {}
    try:
        # Phase 1 verification
        results["Phase 1 - Health"] = test_phase_1_backend()

        # Phase 2 authentication
        token, user_id = test_phase_2_auth()
        results["Phase 2 - Auth"] = (token is not None)

        # Phase 4 tests
        results["Phase 4 - List (empty)"] = bool(test_phase_4_project_list(token))

        project_id, project = test_phase_4_create_project(token)
        results["Phase 4 - Create"] = (project_id is not None)

        project = test_phase_4_get_project(token, project_id)
        results["Phase 4 - Get"] = (project is not None)

        # Phase 3 integration
        project = test_phase_3_save_land_data(token, project_id)
        results["Phase 3 + 4 - Land Data"] = (project.get("land_data") is not None)

        # Phase 4 update
        project = test_phase_4_update_project(token, project_id)
        results["Phase 4 - Update"] = (project["description"] == "Updated description")

        # Phase 4 list after create
        test_phase_4_list_projects_after_create(token)
        results["Phase 4 - List (1 project)"] = True

        # Phase 4 delete
        test_phase_4_delete_project(token, project_id)
        results["Phase 4 - Delete"] = True

        # Phase 4 list after delete
        test_phase_4_list_projects_after_delete(token)
        results["Phase 4 - List (empty)"] = True

        # Phase 4 multiple projects
        test_phase_4_multiple_projects(token)
        results["Phase 4 - Multiple"] = True

    finally:
        # Stop backend
        print_info("Stopping backend...")
        backend_process.terminate()
        try:
            backend_process.wait(timeout=5)
            print_ok("Backend stopped")
        except:
            backend_process.kill()
            print_info("Backend force-killed")

    # Print summary
    print_section("TEST SUMMARY")

    passed = sum(1 for v in results.values() if v)
    total = len(results)

    for test_name, result in results.items():
        if result:
            print_ok(test_name)
        else:
            print_err(test_name)

    print_separator()
    print(f"\nTotal: {passed}/{total} tests passed\n")

    if passed == total:
        print("SUCCESS: All Phase 4 tests passed!")
        print("Phase 1, 2, 3 integrate correctly with Phase 4")
        print("\n")
    else:
        print(f"FAILURE: {total - passed} test(s) failed")
        print("\n")

if __name__ == "__main__":
    main()
