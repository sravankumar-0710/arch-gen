#!/usr/bin/env python3
import subprocess
import time
import requests
import threading
import sys

backend_proc = None
stdout_thread = None

def read_output():
    """Read and print backend output in real-time"""
    while backend_proc and backend_proc.poll() is None:
        line = backend_proc.stderr.readline()
        if line:
            print(f"[BACKEND] {line.rstrip()}")

# Kill any existing processes
subprocess.run(['taskkill', '/F', '/IM', 'python.exe'],
               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(2)

# Start backend
print("[*] Starting backend...")
backend_proc = subprocess.Popen(
    ['python', '-m', 'uvicorn', 'app:app', '--host', '127.0.0.1', '--port', '8000', '--log-level', 'debug'],
    cwd='backend',
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True
)

# Start reader thread
stdout_thread = threading.Thread(target=read_output, daemon=True)
stdout_thread.start()

# Wait for startup
time.sleep(3)

try:
    # Register
    print("[*] Registering...")
    resp = requests.post(
        'http://localhost:8000/auth/register',
        json={'email': f'test-{int(time.time())}@test.com', 'password': 'test123'},
        timeout=5
    )
    token = resp.json()['data']['token']['access_token']
    print(f"[OK] Registered with token: {token[:20]}...")

    # Call generate
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
        timeout=10
    )

    print(f"\n[RESPONSE] Status: {resp.status_code}")
    print(f"[RESPONSE] Body: {resp.text}")

finally:
    print("\n[*] Terminating backend...")
    if backend_proc:
        backend_proc.terminate()
        backend_proc.wait(timeout=5)
