
@echo off
echo ===================================================
echo Cleaning up ports 3300 and 8000...
echo ===================================================

:: Kill process on port 8000 (Backend)
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do (
    echo Killing Backend process PID %%a
    taskkill /f /pid %%a >nul 2>&1
)

:: Kill process on port 3300 (Frontend)
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3300" ^| find "LISTENING"') do (
    echo Killing Frontend process PID %%a
    taskkill /f /pid %%a >nul 2>&1
)

echo ===================================================
echo Starting ComfyUI Wrapper on standard ports...
echo ===================================================

echo Starting Backend (Port 8000)...
start "ComfyWrapper Backend" /D "backend" cmd /k "python -m pip install sqlalchemy && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo Starting Frontend (Port 3300)...
start "ComfyWrapper Frontend" /D "webapp" cmd /k "npm run dev"

echo Done.
echo Backend: http://localhost:8000/docs
echo Frontend: http://localhost:3300
pause
