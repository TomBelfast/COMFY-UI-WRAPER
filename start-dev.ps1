# ============================================
# ComfyUI Wrapper - Dev Server Launcher
# Uruchamia frontend i backend
# Automatycznie zabija procesy przy zamknieciu
# ============================================

$Host.UI.RawUI.WindowTitle = "ComfyUI Wrapper - Dev Servers"

Write-Host ""
Write-Host "  ╔═══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "  ║   COMFYUI WRAPPER - DEV ENVIRONMENT       ║" -ForegroundColor Cyan
Write-Host "  ╚═══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $scriptDir "backend"
$frontendDir = Join-Path $scriptDir "webapp"

$jobs = @()

try {
    # Uruchom Backend
    Write-Host "[1/2] " -NoNewline -ForegroundColor Green
    Write-Host "Uruchamiam Backend (FastAPI na porcie 8000)..."
    
    $backendJob = Start-Job -ScriptBlock {
        param($dir)
        Set-Location $dir
        & ".\venv\Scripts\python.exe" -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
    } -ArgumentList $backendDir
    $jobs += $backendJob
    
    Start-Sleep -Seconds 2

    # Uruchom Frontend
    Write-Host "[2/2] " -NoNewline -ForegroundColor Green
    Write-Host "Uruchamiam Frontend (Next.js na porcie 3000)..."
    
    $frontendJob = Start-Job -ScriptBlock {
        param($dir)
        Set-Location $dir
        npm.cmd run dev
    } -ArgumentList $frontendDir
    $jobs += $frontendJob

    Start-Sleep -Seconds 3

    Write-Host ""
    Write-Host "  ╔═══════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "  ║  SERWERY URUCHOMIONE!                     ║" -ForegroundColor Green
    Write-Host "  ║                                           ║" -ForegroundColor Green
    Write-Host "  ║  Frontend: " -NoNewline -ForegroundColor Green
    Write-Host "http://localhost:3000" -NoNewline -ForegroundColor Yellow
    Write-Host "          ║" -ForegroundColor Green
    Write-Host "  ║  Backend:  " -NoNewline -ForegroundColor Green
    Write-Host "http://localhost:8000" -NoNewline -ForegroundColor Yellow
    Write-Host "          ║" -ForegroundColor Green
    Write-Host "  ║  API Docs: " -NoNewline -ForegroundColor Green
    Write-Host "http://localhost:8000/docs" -NoNewline -ForegroundColor Yellow
    Write-Host "     ║" -ForegroundColor Green
    Write-Host "  ║                                           ║" -ForegroundColor Green
    Write-Host "  ║  Nacisnij Ctrl+C aby zatrzymac wszystko   ║" -ForegroundColor Green
    Write-Host "  ╚═══════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""

    # Monitoruj logi
    while ($true) {
        foreach ($job in $jobs) {
            $output = Receive-Job -Job $job -ErrorAction SilentlyContinue
            if ($output) {
                Write-Host $output
            }
        }
        Start-Sleep -Milliseconds 500
    }
}
finally {
    Write-Host ""
    Write-Host "Zatrzymuje serwery..." -ForegroundColor Yellow
    
    # Zatrzymaj joby
    foreach ($job in $jobs) {
        Stop-Job -Job $job -ErrorAction SilentlyContinue
        Remove-Job -Job $job -Force -ErrorAction SilentlyContinue
    }
    
    # Zabij procesy zombie
    Write-Host "Czyszcze procesy..." -ForegroundColor Yellow
    
    # Zabij procesy node (frontend)
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -like "*next*" -or $_.CommandLine -like "*3000*"
    } | Stop-Process -Force -ErrorAction SilentlyContinue
    
    # Zabij procesy python (backend)
    Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -like "*uvicorn*" -or $_.CommandLine -like "*8000*"
    } | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Write-Host "Gotowe!" -ForegroundColor Green
}
