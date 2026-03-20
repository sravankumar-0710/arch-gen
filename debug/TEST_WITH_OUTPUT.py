#!/usr/bin/env python3
import subprocess
import time
import requests
import threading
import sys

backend = None
output_lines = []

def read_backend_output():
    """Read backend output in real time"""
    while backend and backend.poll() is None:
        try:
            line = backend.stderr.readline()
            if line:
                print(f"[BACKEND] {line.rstrip()}", flush=True)
                output_lines.append(line)
        except:
            pass

# Start backend
print("[*] Starting backend...")
backend = subprocess.Popen(
    ["python", "-m", "uvicorn", "app:app", "--host", "127.0.0.1", "--port", "8000"],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    cwd="backend",
    text=True
)

# Start output reader
reader_thread = threading.Thread(target=read_backend_output, daemon=True)
reader_thread.start()

time.sleep(4)

try:
    # Register
    resp = requests.post(
        'http://localhost:8000/auth/register',
        json={'email': f'test-{int(time.time())}@test.com', 'password': 'test123'},
        timeout=5
    )
    token = resp.json()['data']['token']['access_token']
    print(f"\n[OK] Registered")

    # Generate
    print("[*] Calling /generate...")
    resp = requests.post(
        'http://localhost:8000/generate',
        headers={'Authorization': f'Bearer {token}'},
        json={
            'land_data': {
                'polygonPoints': [{'x': 100, 'y': 100}, {'x': 500, 'y': 100}, {'x': 500, 'y': 400}, {'x': 100, 'y': 400}],
                'unit': 'ft',
                'roadSide': 0,
                'northAngle': 45
            },
            'requirements': {
                'mode': 'basic',
                'vastuEnabled': True,
                'bedroomCount': 2,
                'hasKitchen': True,
                'hasLivingRoom': True,
                'hasDiningRoom': False
            }
        },
        timeout=30
    )

    print(f"\n[RESPONSE] Status: {resp.status_code}")
    print(f"[RESPONSE] Body: {resp.text[:200]}")

finally:
    backend.terminate()
    backend.wait(timeout=5)
    print(f"\n[*] Backend terminated")
    print(f"[*] Backend output lines: {len(output_lines)}")
