@echo off
REM ========================================
REM ArchGen AI - Start All Servers
REM ========================================

echo.
echo ================================================================================
echo ARCHGEN AI - STARTING ALL SERVERS
echo ================================================================================
echo.

REM Start Backend (from backend folder)
echo Starting Backend Server (Port 8000)...
start "ArchGen Backend" cmd /k "cd /d c:\Users\User\Desktop\archgen-ai\backend && c:\Users\User\Desktop\archgen-ai\.venv\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload"
timeout /t 3 >nul

REM Start Frontend (from ROOT folder, NOT src/)
echo Starting Frontend Server (Port 5182)...
start "ArchGen Frontend" cmd /k "cd /d c:\Users\User\Desktop\archgen-ai && npm run dev"
timeout /t 5 >nul

echo.
echo ================================================================================
echo SERVERS STARTED!
echo ================================================================================
echo.
echo Two new windows should have opened:
echo   1. Backend (FastAPI) - http://127.0.0.1:8000
echo   2. Frontend (Vite+React) - http://localhost:5182
echo.
echo IMPORTANT: Wait 10-15 seconds for them to fully start!
echo.
echo Backend will show: "Application startup complete"
echo Frontend will show: "Local: http://localhost:5182/"
echo.
echo TO VERIFY BACKEND:
echo   Open: http://127.0.0.1:8000/health
echo   Should return: {"status":"ok"}
echo.
echo TO USE IN BROWSER:
echo   Open: http://localhost:5182
echo.
echo TO USE IN ELECTRON:
echo   After both servers are running, run: START_ELECTRON.bat
echo.
echo TO STOP:
echo   Close the two terminal windows that opened
echo.
echo ================================================================================
echo.

pause
