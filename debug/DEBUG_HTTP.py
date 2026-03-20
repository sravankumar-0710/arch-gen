#!/usr/bin/env python3
# Test the /generate endpoint directly

import subprocess
import time
import requests
import json

BASE_URL = "http://localhost:8000"
BACKEND_PROCESS = None

def start_backend():
    """Start the backend with verbose logging."""
    global BACKEND_PROCESS
    print("[*] Starting backend server with verbose output...")
    BACKEND_PROCESS = subprocess.Popen(
        ["python", "-m", "uvicorn", "app:app", "--host", "127.0.0.1", "--port", "8000"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd="backend",
        text=True,
        bufsize=1
    )
    # Wait for backend to be ready
    for i in range(20):
        try:
            response = requests.get(f"{BASE_URL}/health", timeout=1)
            if response.status_code == 200:
                print("[OK] Backend ready")
                return
        except:
            pass
        time.sleep(0.5)

def stop_backend():
    """Stop the backend and print its output."""
    if BACKEND_PROCESS:
        print("[*] Stopping backend...")
        BACKEND_PROCESS.terminate()
        stdout, stderr = BACKEND_PROCESS.communicate(timeout=5)
        if stdout:
            print("[STDOUT]:")
            print(stdout[:2000])
        if stderr:
            print("[STDERR]:")
            print(stderr[:2000])

def test():
    start_backend()

    try:
        # Register user
        print("\n[*] Registering user...")
        resp = requests.post(
            f"{BASE_URL}/auth/register",
            json={"email": f"debug-test-{int(time.time())}@test.com", "password": "test123456"},
            timeout=5
        )
        print(f"[{resp.status_code}] Register response: {resp.json()}")
        if resp.status_code == 201:
            token = resp.json()['data']['token']['access_token']
        else:
            # Try login instead
            email = f"debug-test-{int(time.time())-100}@test.com"
            resp = requests.post(
                f"{BASE_URL}/auth/login",
                json={"email": email, "password": "test123456"},
                timeout=5
            )
            token = resp.json()['data']['token']['access_token']

        # Generate layouts
        print("\n[*] Calling /generate endpoint...")
        resp = requests.post(
            f"{BASE_URL}/generate",
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
            },
            timeout=10
        )

        print(f"[{resp.status_code}] Generate response (raw):")
        print(resp.text)
        print(f"\n[{resp.status_code}] Generate response (parsed):")
        print(json.dumps(resp.json(), indent=2))

    except Exception as e:
        print(f"[ERROR] {e}")
        import traceback
        traceback.print_exc()
    finally:
        stop_backend()

if __name__ == "__main__":
    test()
