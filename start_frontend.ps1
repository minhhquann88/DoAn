# Script khởi động Frontend
Write-Host "🚀 Khởi động Frontend..." -ForegroundColor Cyan
Write-Host ""

# Kiểm tra .env
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Tạo file .env..." -ForegroundColor Yellow
    @"
# Gemini API Key cho Frontend (React + Vite)
VITE_GEMINI_API_KEY=AIzaSyCnTIWymkl8U_-u_WgFTAF4NRxqO3VwVHI
"@ | Out-File -FilePath ".env" -Encoding UTF8
}

# Kiểm tra node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  Cài đặt dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "✅ Bắt đầu dev server..." -ForegroundColor Green
Write-Host "   URL: http://localhost:5173" -ForegroundColor Gray
Write-Host ""

# Chạy npm run dev và mở browser sau 3 giây
Start-Process "http://localhost:5173" -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
npm run dev
