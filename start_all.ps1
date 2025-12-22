# Script để chạy tất cả services: Backend + Frontend + Chatbot Python
# Chạy trong PowerShell: .\start_all.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 KHỞI ĐỘNG TẤT CẢ SERVICES" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra .env file cho frontend
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Tạo file .env cho frontend..." -ForegroundColor Yellow
    @"
# Gemini API Key cho Frontend (React + Vite)
VITE_GEMINI_API_KEY=AIzaSyCnTIWymkl8U_-u_WgFTAF4NRxqO3VwVHI
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ Đã tạo file .env" -ForegroundColor Green
}

# 1. Backend Spring Boot
Write-Host ""
Write-Host "1️⃣  Khởi động Backend (Spring Boot)..." -ForegroundColor Cyan
Write-Host "   URL: http://localhost:8080" -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host 'Backend Spring Boot' -ForegroundColor Green; .\start_simple.bat" -WindowStyle Normal

Start-Sleep -Seconds 3

# 2. Chatbot Python
Write-Host ""
Write-Host "2️⃣  Khởi động Chatbot Python (FastAPI)..." -ForegroundColor Cyan
Write-Host "   URL: http://localhost:8000" -ForegroundColor Gray

# Kiểm tra venv
if (-not (Test-Path ".venv")) {
    Write-Host "   ⚠️  Tạo Python virtual environment..." -ForegroundColor Yellow
    python -m venv .venv
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; .\.venv\Scripts\activate; Write-Host 'Chatbot Python FastAPI' -ForegroundColor Green; if (-not (Get-Command uvicorn -ErrorAction SilentlyContinue)) { pip install -r requirements.txt }; uvicorn src.main:app --reload --port 8000" -WindowStyle Normal

Start-Sleep -Seconds 3

# 3. Frontend React
Write-Host ""
Write-Host "3️⃣  Khởi động Frontend (React + Vite)..." -ForegroundColor Cyan
Write-Host "   URL: http://localhost:5173" -ForegroundColor Gray

# Kiểm tra node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "   ⚠️  Cài đặt dependencies..." -ForegroundColor Yellow
    npm install
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host 'Frontend React + Vite' -ForegroundColor Green; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ TẤT CẢ SERVICES ĐÃ KHỞI ĐỘNG!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Các URL:" -ForegroundColor Yellow
Write-Host "   • Backend API:     http://localhost:8080" -ForegroundColor White
Write-Host "   • Chatbot API:     http://localhost:8000" -ForegroundColor White
Write-Host "   • Frontend:        http://localhost:5173" -ForegroundColor White
Write-Host "   • API Test Page:   http://localhost:5173/module-test" -ForegroundColor White
Write-Host ""
Write-Host "💡 Để dừng tất cả, đóng các cửa sổ PowerShell" -ForegroundColor Gray
Write-Host ""

