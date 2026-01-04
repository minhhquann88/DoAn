# Script test local trước khi commit và deploy
# Chạy: .\test-local.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🧪 TEST LOCAL TRƯỚC KHI DEPLOY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra backend có đang chạy không
Write-Host "1. Kiểm tra Backend (port 8080)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/courses" -Method GET -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Backend đang chạy" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Backend không chạy hoặc không accessible" -ForegroundColor Red
    Write-Host "   💡 Chạy backend trước: cd backend && .\mvnw.cmd spring-boot:run" -ForegroundColor Yellow
    exit 1
}

# Kiểm tra frontend có đang chạy không
Write-Host ""
Write-Host "2. Kiểm tra Frontend (port 3000)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Frontend đang chạy" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  Frontend không chạy (không bắt buộc cho test backend)" -ForegroundColor Yellow
}

# Test các endpoint quan trọng
Write-Host ""
Write-Host "3. Test các endpoint quan trọng..." -ForegroundColor Yellow

$endpoints = @(
    @{Path="/api/v1/courses"; Method="GET"; Name="Get Courses"},
    @{Path="/api/v1/courses/featured"; Method="GET"; Name="Get Featured Courses"},
    @{Path="/api/v1/vnpay/ipn"; Method="GET"; Name="VNPay IPN (test call)"}
)

$allPassed = $true
foreach ($endpoint in $endpoints) {
    try {
        $url = "http://localhost:8080$($endpoint.Path)"
        $response = Invoke-WebRequest -Uri $url -Method $endpoint.Method -TimeoutSec 5 -ErrorAction Stop
        Write-Host "   ✅ $($endpoint.Name): $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ $($endpoint.Name): $($_.Exception.Message)" -ForegroundColor Red
        $allPassed = $false
    }
}

# Kiểm tra compile
Write-Host ""
Write-Host "4. Kiểm tra compile backend..." -ForegroundColor Yellow
Set-Location backend
try {
    $output = & .\mvnw.cmd clean compile -q 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Compile thành công" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Compile thất bại" -ForegroundColor Red
        Write-Host $output
        $allPassed = $false
    }
} catch {
    Write-Host "   ❌ Lỗi khi compile: $($_.Exception.Message)" -ForegroundColor Red
    $allPassed = $false
}
Set-Location ..

# Kiểm tra linter (nếu có)
Write-Host ""
Write-Host "5. Kiểm tra linter..." -ForegroundColor Yellow
Write-Host "   ⚠️  Bỏ qua (cần IDE để check)" -ForegroundColor Yellow

# Tổng kết
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "✅ TẤT CẢ TEST ĐÃ PASS!" -ForegroundColor Green
    Write-Host "   Bạn có thể commit và deploy an toàn" -ForegroundColor Green
} else {
    Write-Host "❌ CÓ LỖI! Vui lòng sửa trước khi commit" -ForegroundColor Red
}
Write-Host "========================================" -ForegroundColor Cyan

