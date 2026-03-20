#!/usr/bin/env python3
# Debug script to see full traceback from layout generation endpoint

import requests
import json
import subprocess
import time
import random
import string

# Start backend
print("[*] Starting backend...")
proc = subprocess.Popen(
    ["python", "-m", "uvicorn", "app:app", "--host", "127.0.0.1", "--port", "8000"],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    cwd="backend"
)
time.sleep(4)

try:
    # Register user
    email = f"debugtest-{random.randint(100,999)}@example.com"
    print(f"[*] Registering user {email}...")
    resp = requests.post("http://localhost:8000/auth/register", json={
        "email": email,
        "password": "test123456"
    })
    print(f"Register status: {resp.status_code}")
    if resp.status_code not in [200, 201]:
        print(f"Register failed: {resp.text[:200]}")
        exit(1)

    resp_data = resp.json()
    token = resp_data['data']['token']['access_token']
    print(f"[OK] Got token: {token[:50]}...")

    # Call layout generation
    print("[*] Calling layout generation...")
    resp = requests.post("http://localhost:8000/generate",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "land_data": {
                "polygonPoints": [{"x": 100, "y": 100}, {"x": 500, "y": 100}, {"x": 500, "y": 400}, {"x": 100, "y": 400}],
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

    print(f"Status: {resp.status_code}")
    resp_data = resp.json()
    if 'detail' in resp_data:
        print(f"Error detail:\n{resp_data['detail']}")
    else:
        print(f"Response:\n{json.dumps(resp_data, indent=2)[:500]}...")

finally:
    print("[*] Stopping backend...")
    proc.terminate()

