@echo off
echo ===================================================
echo ComfyUI Wrapper - PRODUCTION MODE
echo ===================================================

echo Cleaning up ports 3300 and 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3300" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

echo Starting Backend (Port 8000)...
start "ComfyWrapper Backend" /D "backend" cmd /k ".\venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --log-level info"

echo Starting Frontend (Port 3300)...
start "ComfyWrapper Frontend" /D "webapp" cmd /k "npm run start"

echo ===================================================
echo APPLICATION READY (Production Mode)
echo Frontend: http://localhost:3300
echo Backend:  http://localhost:8000
echo ===================================================
pause
