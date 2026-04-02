@echo off
REM ========================================
REM ArchGen AI - Start Electron Desktop App
REM ========================================

echo.
echo ================================================================================
echo ARCHGEN AI - STARTING ELECTRON DESKTOP APP
echo ================================================================================
echo.
echo IMPORTANT: Make sure the backend and frontend servers are running first!
echo   - Backend should be on http://127.0.0.1:8000
echo   - Frontend should be on http://localhost:5182
echo.
echo If not running, run START_ALL_SERVERS.bat first.
echo.
echo ================================================================================
echo.

cd /d c:\Users\User\Desktop\archgen-ai

echo Starting Electron...
npm run electron:dev

echo.
echo Electron has exited.
pause
