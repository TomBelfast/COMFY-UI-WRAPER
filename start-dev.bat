@echo off
REM ============================================
REM ComfyUI Wrapper - Dev Server Launcher
REM ============================================

title ComfyUI Wrapper - Dev Servers

echo.
echo  ╔═══════════════════════════════════════════╗
echo  ║   COMFYUI WRAPPER - DEV ENVIRONMENT       ║
echo  ╚═══════════════════════════════════════════╝
echo.

REM --- PROCESS CLEANUP ---
echo [0/2] Czyszczenie portow...

REM Kill Backend on 8000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    echo Zamykanie poprzedniego procesu Backend (PID: %%a)...
    taskkill /f /pid %%a >nul 2>&1
    echo ✅ Port 8000 zwolniony.
)

REM Kill Frontend on 3300
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3300 ^| findstr LISTENING') do (
    echo Zamykanie poprzedniego procesu Frontend (PID: %%a)...
    taskkill /f /pid %%a >nul 2>&1
    echo ✅ Port 3300 zwolniony.
)

REM --- START SERVERS ---

REM Uruchom Backend (FastAPI)
echo [1/2] Uruchamiam Backend (FastAPI na porcie 8000) w trybie DEBUG...
cd /d "%~dp0backend"
start /b cmd /c ".\venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 --log-level debug 2>&1"
timeout /t 2 /nobreak >nul

REM Uruchom Frontend (Next.js)
echo [2/2] Uruchamiam Frontend (Next.js na porcie 3300)...
cd /d "%~dp0webapp"
set PORT=3300
start /b cmd /c "npm.cmd run dev 2>&1"
timeout /t 3 /nobreak >nul

echo.
echo  ╔═══════════════════════════════════════════╗
echo  ║  SERWERY URUCHOMIONE!                     ║
echo  ║                                           ║
echo  ║  Frontend: http://localhost:3300          ║
echo  ║  Backend:  http://localhost:8000          ║
echo  ║  API Docs: http://localhost:8000/docs     ║
echo  ║                                           ║
echo  ║  Log Streamer: Aktywny na frontendzie     ║
echo  ║                                           ║
echo  ║  Nacisnij Ctrl+C aby zatrzymac wszystko   ║
echo  ╚═══════════════════════════════════════════╝
echo.

:loop
timeout /t 5 /nobreak >nul
goto loop
