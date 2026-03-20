#!/usr/bin/env python3
import subprocess
import time
import requests
import threading

def start_backend_with_output():
    backend = subprocess.Popen(
        ['python', '-m', 'uvicorn', 'app:app', '--host', '127.0.0.1', '--port', '8000'],
        cwd='backend',
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )

    # Read and print output
    for line in iter(backend.stdout.readline, ''):
        print(f"[BACKEND] {line.rstrip()}")

    return backend

# Start backend in background
print("[*] Starting backend...")
backend_thread = threading.Thread(target=start_backend_with_output, daemon=True)
backend_thread.start()
time.sleep(4)

try:
    # Register
    print("\n[*] Registering user...")
    resp = requests.post('http://localhost:8000/auth/register',
        json={'email': f'test-{int(time.time())}@test.com', 'password': 'test123'}, timeout=5)
    token = resp.json()['data']['token']['access_token']
    print(f"[OK] Registered")

    # Generate - with verbose output
    print("\n[*] Calling /generate...")
    resp = requests.post('http://localhost:8000/generate',
        headers={'Authorization': f'Bearer {token}'},
        json={
            'land_data': {'polygonPoints': [{'x': 100, 'y': 100}, {'x': 500, 'y': 100}, {'x': 500, 'y': 400}, {'x': 100, 'y': 400}], 'unit': 'ft', 'roadSide': 0, 'northAngle': 45},
            'requirements': {'mode': 'basic', 'vastuEnabled': True, 'bedroomCount': 2, 'hasKitchen': True, 'hasLivingRoom': True, 'hasDiningRoom': False}
        },
        timeout=20
    )

    print(f"\n[RESPONSE] Status: {resp.status_code}")
    print(f"[RESPONSE] Headers: {dict(resp.headers)}")
    print(f"[RESPONSE] Text: {resp.text}")
    print(f"[RESPONSE] JSON: {resp.json() if resp.headers.get('content-type') == 'application/json' else 'N/A'}")

except Exception as e:
    print(f"[ERROR] {e}")
    import traceback
    traceback.print_exc()
finally:
    time.sleep(2)
