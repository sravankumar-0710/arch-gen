#!/usr/bin/env python3
"""
Start both backend and frontend servers in detached mode
"""
import subprocess
import sys
import os
import time
import urllib.request
import urllib.error

def check_backend_health():
    """Check if backend is responding"""
    try:
        response = urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=1)
        return response.status == 200
    except:
        return False

def start_backend():
    """Start FastAPI backend server"""
    print("=" * 80)
    print("STARTING BACKEND SERVER")
    print("=" * 80)
    
    backend_process = subprocess.Popen(
        [sys.executable, '-m', 'uvicorn', 'app:app', '--host', '127.0.0.1', '--port', '8000', '--reload'],
        cwd=os.path.join(os.path.dirname(__file__), 'backend'),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform == 'win32' else 0
    )
    
    print(f"[OK] Backend server starting (PID: {backend_process.pid})")
    print("     URL: http://127.0.0.1:8000")
    print("     Docs: http://127.0.0.1:8000/docs")
    print("\nWaiting for backend to be ready...", end="", flush=True)
    
    # Wait for backend to be ready (max 15 seconds)
    for i in range(30):
        if check_backend_health():
            print(f"\n[OK] Backend is ready! (took {i*0.5:.1f}s)")
            return backend_process
        time.sleep(0.5)
        if i % 2 == 0:
            print(".", end="", flush=True)
    
    print("\n[WARNING] Backend taking longer than expected...")
    return backend_process

def start_frontend():
    """Start Vite frontend dev server"""
    print("\n" + "=" * 80)
    print("STARTING FRONTEND SERVER")
    print("=" * 80)
    
    # Check if running from src or root
    vite_config_in_src = os.path.exists('src/vite.config.js')
    
    if vite_config_in_src:
        frontend_cwd = os.path.join(os.path.dirname(__file__), 'src')
    else:
        frontend_cwd = os.path.dirname(__file__)
    
    frontend_process = subprocess.Popen(
        ['npm', 'run', 'dev'],
        cwd=frontend_cwd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform == 'win32' else 0
    )
    
    print(f"[OK] Frontend server starting (PID: {frontend_process.pid})")
    print("     URL: http://localhost:5182")
    print("\nWaiting for frontend to be ready...", end="", flush=True)
    
    # Wait a bit for frontend to start
    time.sleep(3)
    print("\n[OK] Frontend should be ready!")
    
    return frontend_process

def main():
    print("\n" + "=" * 80)
    print("ARCHGEN AI - SERVER STARTUP")
    print("=" * 80 + "\n")
    
    # Start backend
    backend_process = start_backend()
    
    # Start frontend
    try:
        frontend_process = start_frontend()
    except FileNotFoundError:
        print("[ERROR] npm not found - cannot start frontend")
        print("Please install Node.js from https://nodejs.org/")
        frontend_process = None
    
    # Summary
    print("\n" + "=" * 80)
    print("SERVER STATUS")
    print("=" * 80)
    print(f"Backend PID: {backend_process.pid} | Status: {'Running' if backend_process.poll() is None else 'Stopped'}")
    if frontend_process:
        print(f"Frontend PID: {frontend_process.pid} | Status: {'Running' if frontend_process.poll() is None else 'Stopped'}")
    else:
        print("Frontend: Not started (npm not found)")
    
    print("\n" + "=" * 80)
    print("ACCESS YOUR APP")
    print("=" * 80)
    print("Frontend: http://localhost:5182")
    print("Backend:  http://127.0.0.1:8000")
    print("API Docs: http://127.0.0.1:8000/docs")
    
    print("\n" + "=" * 80)
    print("TO STOP SERVERS")
    print("=" * 80)
    print(f"Backend:  taskkill /PID {backend_process.pid} /F")
    if frontend_process:
        print(f"Frontend: taskkill /PID {frontend_process.pid} /F")
    print("=" * 80 + "\n")

if __name__ == '__main__':
    main()
