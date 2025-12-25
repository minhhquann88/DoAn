# ============================================
# Script khởi động TẤT CẢ services
# Backend (Java) + Frontend (Next.js) + Chatbot (Python)
# ============================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "KHOI DONG TAT CA SERVICES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = $PSScriptRoot
$backendPath = Join-Path $projectRoot "backend"
$frontendPath = Join-Path $projectRoot "frontend"

# Kiểm tra các thư mục
if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Khong tim thay thu muc backend!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendPath)) {
    Write-Host "❌ Khong tim thay thu muc frontend!" -ForegroundColor Red
    exit 1
}

# Kiểm tra các port
Write-Host "Dang kiem tra cac port..." -ForegroundColor Yellow
$ports = @{
    "8080" = "Backend (Java Spring Boot)"
    "3000" = "Frontend (Next.js)"
    "8000" = "Chatbot (Python FastAPI)"
}

$portsInUse = @()
foreach ($port in $ports.Keys) {
    $check = netstat -an | Select-String ":$port"
    if ($check) {
        Write-Host "  ⚠️  Port $port ($($ports[$port])) dang duoc su dung" -ForegroundColor Yellow
        $portsInUse += $port
    } else {
        Write-Host "  ✅ Port $port ($($ports[$port])) san sang" -ForegroundColor Green
    }
}

if ($portsInUse.Count -gt 0) {
    Write-Host ""
    Write-Host "⚠️  Co $($portsInUse.Count) port dang duoc su dung!" -ForegroundColor Yellow
    Write-Host "   Ban co muon tiep tuc? (Y/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -ne "Y" -and $response -ne "y") {
        Write-Host "Da huy khoi dong" -ForegroundColor Red
        exit 0
    }
}

Write-Host ""

# Tạo các job để chạy song song
Write-Host "Dang khoi dong cac services..." -ForegroundColor Cyan
Write-Host ""

# 1. Khởi động Backend
Write-Host "[1/3] Khoi dong Backend (Java Spring Boot)..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:backendPath
    & ".\mvnw.cmd" spring-boot:run 2>&1 | Out-Null
} -Name "Backend"

# 2. Khởi động Chatbot
Write-Host "[2/3] Khoi dong Chatbot (Python FastAPI)..." -ForegroundColor Yellow
$venvPath = Join-Path $projectRoot ".venv"
$activateScript = Join-Path $venvPath "Scripts\Activate.ps1"

if (-not (Test-Path $venvPath)) {
    Write-Host "  ⚠️  Virtual environment chua duoc tao!" -ForegroundColor Yellow
    Write-Host "  Dang chay setup_chatbot.ps1..." -ForegroundColor Cyan
    & "$projectRoot\setup_chatbot.ps1"
}

$chatbotJob = Start-Job -ScriptBlock {
    Set-Location $using:projectRoot
    $venvPath = Join-Path $using:projectRoot ".venv"
    $activateScript = Join-Path $venvPath "Scripts\Activate.ps1"
    & $activateScript
    python start_chatbot.py 2>&1 | Out-Null
} -Name "Chatbot"

# 3. Khởi động Frontend
Write-Host "[3/3] Khoi dong Frontend (Next.js)..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:frontendPath
    npm run dev 2>&1 | Out-Null
} -Name "Frontend"

# Đợi một chút để các service khởi động
Write-Host ""
Write-Host "Dang cho cac services khoi dong..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Kiểm tra trạng thái
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TRANG THAI SERVICES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$services = @(
    @{Name="Backend"; Port=8080; URL="http://localhost:8080/api/public/health"; Job=$backendJob},
    @{Name="Chatbot"; Port=8000; URL="http://localhost:8000/health"; Job=$chatbotJob},
    @{Name="Frontend"; Port=3000; URL="http://localhost:3000"; Job=$frontendJob}
)

foreach ($service in $services) {
    $status = "⏳ Dang khoi dong..."
    try {
        $response = Invoke-WebRequest -Uri $service.URL -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 404) {
            $status = "✅ Dang chay"
        }
    } catch {
        $status = "⏳ Dang khoi dong..."
    }
    
    Write-Host "  $($service.Name) (Port $($service.Port)): $status" -ForegroundColor $(if ($status -like "*✅*") { "Green" } else { "Yellow" })
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "THONG TIN TRUY CAP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Backend API:  http://localhost:8080/api" -ForegroundColor White
Write-Host "  Chatbot API:  http://localhost:8000/api/v1" -ForegroundColor White
Write-Host "  Frontend:     http://localhost:3000" -ForegroundColor White
Write-Host "  API Docs:      http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "De dung tat ca services, nhan Ctrl+C hoac chay:" -ForegroundColor Yellow
Write-Host "  Stop-Job -Name Backend,Chatbot,Frontend" -ForegroundColor White
Write-Host "  Remove-Job -Name Backend,Chatbot,Frontend" -ForegroundColor White
Write-Host ""
Write-Host "Dang theo doi logs (nhan Ctrl+C de thoat)..." -ForegroundColor Cyan
Write-Host ""

# Hiển thị logs
try {
    Get-Job | Receive-Job -Wait
} catch {
    Write-Host "`nDa dung cac services" -ForegroundColor Yellow
    Stop-Job -Name Backend,Chatbot,Frontend -ErrorAction SilentlyContinue
    Remove-Job -Name Backend,Chatbot,Frontend -ErrorAction SilentlyContinue
}

