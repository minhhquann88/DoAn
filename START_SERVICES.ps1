# ========================================
# E-LEARNING PLATFORM - START ALL SERVICES
# ========================================
# Run this script in PowerShell

$ErrorActionPreference = "SilentlyContinue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " E-LEARNING PLATFORM - STARTUP SCRIPT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get the script's directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "Project Path: $scriptPath" -ForegroundColor Yellow
Write-Host ""

# Function to start a service in new terminal
function Start-Service {
    param (
        [string]$Name,
        [string]$Command,
        [string]$WorkingDir,
        [string]$Color = "White"
    )
    
    Write-Host "Starting $Name..." -ForegroundColor $Color
    Write-Host "  Directory: $WorkingDir"
    Write-Host "  Command: $Command"
    Write-Host ""
    
    # Start new PowerShell window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$WorkingDir'; Write-Host 'Starting $Name...' -ForegroundColor Green; $Command"
}

# Check if services are already running
Write-Host "Checking ports..." -ForegroundColor Yellow

$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
$port8080 = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
$port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue

if ($port3000) {
    Write-Host "  Port 3000 (Frontend): IN USE" -ForegroundColor Green
} else {
    Write-Host "  Port 3000 (Frontend): Available" -ForegroundColor Gray
}

if ($port8080) {
    Write-Host "  Port 8080 (Backend): IN USE" -ForegroundColor Green
} else {
    Write-Host "  Port 8080 (Backend): Available" -ForegroundColor Gray
}

if ($port8000) {
    Write-Host "  Port 8000 (Chatbot): IN USE" -ForegroundColor Green
} else {
    Write-Host "  Port 8000 (Chatbot): Available" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " STARTING SERVICES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start Backend (if not running)
if (-not $port8080) {
    Write-Host "[1/3] Starting Backend (Spring Boot)..." -ForegroundColor Yellow
    $backendPath = Join-Path $scriptPath "backend"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'Starting Spring Boot Backend...' -ForegroundColor Green; .\mvnw spring-boot:run"
    Write-Host "  Backend starting in new terminal" -ForegroundColor Green
} else {
    Write-Host "[1/3] Backend already running on port 8080" -ForegroundColor Green
}

Start-Sleep -Seconds 2

# Start Chatbot (if not running)
if (-not $port8000) {
    Write-Host "[2/3] Starting Chatbot (FastAPI)..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath'; .\.venv\Scripts\Activate.ps1; Write-Host 'Starting Chatbot...' -ForegroundColor Green; python -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload"
    Write-Host "  Chatbot starting in new terminal" -ForegroundColor Green
} else {
    Write-Host "[2/3] Chatbot already running on port 8000" -ForegroundColor Green
}

Start-Sleep -Seconds 2

# Start Frontend (if not running)
if (-not $port3000) {
    Write-Host "[3/3] Starting Frontend (Next.js)..." -ForegroundColor Yellow
    $frontendPath = Join-Path $scriptPath "frontend"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'Starting Next.js Frontend...' -ForegroundColor Green; Start-Process 'http://localhost:3000' -ErrorAction SilentlyContinue; npm run dev"
    Write-Host "  Frontend starting in new terminal" -ForegroundColor Green
} else {
    Write-Host "[3/3] Frontend already running on port 3000" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " SERVICES STARTED" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "URLs:" -ForegroundColor Yellow
Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor Green
Write-Host "  Backend:   http://localhost:8080" -ForegroundColor Green
Write-Host "  Chatbot:   http://localhost:8000" -ForegroundColor Green
Write-Host "  API Docs:  http://localhost:8000/docs" -ForegroundColor Green
Write-Host ""
Write-Host "Wait 30-60 seconds for all services to start..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

