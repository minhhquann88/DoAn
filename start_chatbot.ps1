# ============================================
# Script khởi động Chatbot AI
# ============================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "KHOI DONG CHATBOT AI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = $PSScriptRoot
$venvPath = Join-Path $projectRoot ".venv"
$activateScript = Join-Path $venvPath "Scripts\Activate.ps1"

# Kiểm tra virtual environment
if (-not (Test-Path $venvPath)) {
    Write-Host "❌ Virtual environment chua duoc tao!" -ForegroundColor Red
    Write-Host "   Vui long chay: .\setup_chatbot.ps1" -ForegroundColor Yellow
    exit 1
}

# Kiểm tra port 8000
Write-Host "Dang kiem tra port 8000..." -ForegroundColor Yellow
$port8000 = netstat -an | Select-String ":8000"
if ($port8000) {
    Write-Host "⚠️  Port 8000 dang duoc su dung!" -ForegroundColor Yellow
    Write-Host "   Co the chatbot da dang chay hoac co ung dung khac" -ForegroundColor White
    Write-Host "   Ban co muon tiep tuc? (Y/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -ne "Y" -and $response -ne "y") {
        Write-Host "Da huy khoi dong" -ForegroundColor Red
        exit 0
    }
} else {
    Write-Host "✅ Port 8000 san sang" -ForegroundColor Green
}

Write-Host ""

# Activate virtual environment và chạy
Write-Host "Dang kich hoat virtual environment..." -ForegroundColor Cyan
if (Test-Path $activateScript) {
    & $activateScript
    
    Write-Host "✅ Da kich hoat virtual environment" -ForegroundColor Green
    Write-Host ""
    Write-Host "Dang khoi dong Chatbot API..." -ForegroundColor Cyan
    Write-Host "  URL: http://localhost:8000" -ForegroundColor White
    Write-Host "  Health: http://localhost:8000/health" -ForegroundColor White
    Write-Host "  Docs: http://localhost:8000/docs" -ForegroundColor White
    Write-Host ""
    Write-Host "Nhan Ctrl+C de dung server" -ForegroundColor Yellow
Write-Host ""

    # Chạy chatbot
    Set-Location $projectRoot
    python start_chatbot.py
} else {
    Write-Host "❌ Khong tim thay virtual environment!" -ForegroundColor Red
    Write-Host "   Vui long chay: .\setup_chatbot.ps1" -ForegroundColor Yellow
    exit 1
}
