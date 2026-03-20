#!/usr/bin/env python3
"""Test the generate endpoint directly"""

import sys
import os
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))

from fastapi.testclient import TestClient
from app import app
from database import init_db

# Initialize database
print("[*] Initializing database...")
init_db()
print("[OK] Database initialized")

client = TestClient(app)

# Register or login
print("[*] Registering/logging in user...")
resp = client.post("/auth/register", json={"email": f"test-{int(__import__('time').time())}@test.com", "password": "password123"})
if resp.status_code != 201:
    print(f"[*] Register failed with {resp.status_code}, trying login...")
    resp = client.post("/auth/login", json={"email": "test@test.com", "password": "password123"})

if resp.status_code not in [200, 201]:
    print(f"[ERR] Failed to get token: {resp.json()}")
    sys.exit(1)

print(f"[{resp.status_code}] {resp.json()}")
token = resp.json()['data']['token']['access_token']

# Generate
print("\n[*] Calling /generate...")
resp = client.post(
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

print(f"[{resp.status_code}] {resp.text}")
if resp.headers.get('content-type') == 'application/json':
    import json
    print(f"[JSON] {json.dumps(resp.json(), indent=2)}")
