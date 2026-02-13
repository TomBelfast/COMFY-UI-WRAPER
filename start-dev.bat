@echo off
REM ============================================
REM ComfyUI Wrapper - Dev Server Launcher
REM Uruchamia frontend i backend w jednym terminalu
REM Ctrl+C zatrzymuje wszystko czysto
REM ============================================

title ComfyUI Wrapper - Dev Servers

echo.
echo  ╔═══════════════════════════════════════════╗
echo  ║   COMFYUI WRAPPER - DEV ENVIRONMENT       ║
echo  ╚═══════════════════════════════════════════╝
echo.

REM Zapisz PIDy do pliku tymczasowego
set "PID_FILE=%TEMP%\comfy_wrapper_pids.txt"
if exist "%PID_FILE%" del "%PID_FILE%"

REM Uruchom Backend (FastAPI)
echo [1/2] Uruchamiam Backend (FastAPI na porcie 8000)...
cd /d "%~dp0backend"
start /b cmd /c ".\venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 2>&1"
timeout /t 2 /nobreak >nul

REM Uruchom Frontend (Next.js)
echo [2/2] Uruchamiam Frontend (Next.js na porcie 3300)...
cd /d "%~dp0webapp"
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
echo  ║  Nacisnij Ctrl+C aby zatrzymac wszystko   ║
echo  ╚═══════════════════════════════════════════╝
echo.

REM Czekaj na Ctrl+C i posprzataj
:loop
timeout /t 5 /nobreak >nul
goto loop
