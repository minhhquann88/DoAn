# ============================================
# Script khoi dong Frontend + Backend (khong co Chatbot)
# ============================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "KHOI DONG FRONTEND + BACKEND" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = $PSScriptRoot
$backendPath = Join-Path $projectRoot "backend"
$frontendPath = Join-Path $projectRoot "frontend"

# Kiem tra cac thu muc
if (-not (Test-Path $backendPath)) {
    Write-Host "Khong tim thay thu muc backend!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendPath)) {
    Write-Host "Khong tim thay thu muc frontend!" -ForegroundColor Red
    exit 1
}

# Kiem tra cac port
Write-Host "Dang kiem tra cac port..." -ForegroundColor Yellow
$ports = @{
    "8080" = "Backend (Java Spring Boot)"
    "3000" = "Frontend (Next.js)"
}

$portsInUse = @()
foreach ($port in $ports.Keys) {
    $check = netstat -an | Select-String ":$port"
    if ($check) {
        Write-Host "  Port $port ($($ports[$port])) dang duoc su dung" -ForegroundColor Yellow
        $portsInUse += $port
    } else {
        Write-Host "  Port $port ($($ports[$port])) san sang" -ForegroundColor Green
    }
}

if ($portsInUse.Count -gt 0) {
    Write-Host ""
    Write-Host "Co $($portsInUse.Count) port dang duoc su dung!" -ForegroundColor Yellow
    Write-Host "   Ban co muon tiep tuc? (Y/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -ne "Y" -and $response -ne "y") {
        Write-Host "Da huy khoi dong" -ForegroundColor Red
        exit 0
    }
}

Write-Host ""

# 1. Khoi dong Backend
Write-Host "[1/2] Khoi dong Backend (Java Spring Boot)..." -ForegroundColor Yellow
Write-Host "  URL: http://localhost:8080" -ForegroundColor Gray
Write-Host "  API: http://localhost:8080/api" -ForegroundColor Gray
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host '========================================' -ForegroundColor Cyan; Write-Host 'BACKEND SPRING BOOT' -ForegroundColor Green; Write-Host '========================================' -ForegroundColor Cyan; Write-Host ''; if (Test-Path '.\mvnw.cmd') { .\mvnw.cmd spring-boot:run } else { Write-Host 'Khong tim thay mvnw.cmd. Vui long chay: mvn spring-boot:run' -ForegroundColor Yellow }" -WindowStyle Normal

Start-Sleep -Seconds 3

# 2. Khoi dong Frontend
Write-Host "[2/2] Khoi dong Frontend (Next.js)..." -ForegroundColor Yellow
Write-Host "  URL: http://localhost:3000" -ForegroundColor Gray
Write-Host ""

# Kiem tra node_modules
if (-not (Test-Path (Join-Path $frontendPath "node_modules"))) {
    Write-Host "  Dang cai dat dependencies cho Frontend..." -ForegroundColor Yellow
    Set-Location $frontendPath
    npm install
    Set-Location $projectRoot
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host '========================================' -ForegroundColor Cyan; Write-Host 'FRONTEND NEXT.JS' -ForegroundColor Green; Write-Host '========================================' -ForegroundColor Cyan; Write-Host ''; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DA KHOI DONG!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Cac URL:" -ForegroundColor Yellow
Write-Host "  Backend API:  http://localhost:8080/api" -ForegroundColor White
Write-Host "  Frontend:     http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Dang cho cac services khoi dong (10 giay)..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Kiem tra trang thai
Write-Host ""
Write-Host "Dang kiem tra trang thai..." -ForegroundColor Cyan

# Test Backend
try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/public/health" -TimeoutSec 3 -UseBasicParsing -ErrorAction SilentlyContinue
    if ($backendResponse.StatusCode -eq 200) {
        Write-Host "  Backend: Dang chay" -ForegroundColor Green
    }
} catch {
    Write-Host "  Backend: Dang khoi dong..." -ForegroundColor Yellow
}

# Test Frontend
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 3 -UseBasicParsing -ErrorAction SilentlyContinue
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "  Frontend: Dang chay" -ForegroundColor Green
    }
} catch {
    Write-Host "  Frontend: Dang khoi dong..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "De dung cac services, dong cac cua so PowerShell" -ForegroundColor Gray
Write-Host ""
