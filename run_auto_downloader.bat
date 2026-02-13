@echo off
set "PYTHON_EXE=C:\ComfyUI_V81\ComfyUI\venv\Scripts\python.exe"
set "SCRIPT_PATH=C:\ComfyUI_V81\auto_workflow_downloader.py"

echo Checking for new workflows in downloader_queue...
"%PYTHON_EXE%" "%SCRIPT_PATH%"

echo.
echo Process finished.
pause
