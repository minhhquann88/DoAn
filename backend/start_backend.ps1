# ============================================
# Script khởi động Backend Spring Boot
# ============================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "KHOI DONG BACKEND" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backendPath = $PSScriptRoot

# Kiểm tra Maven Wrapper
$mvnwPath = Join-Path $backendPath "mvnw.cmd"
if (-not (Test-Path $mvnwPath)) {
    Write-Host "❌ Khong tim thay Maven Wrapper (mvnw.cmd)" -ForegroundColor Red
    Write-Host ""
    Write-Host "CACH KHAC:" -ForegroundColor Yellow
    Write-Host "  1. Mo IDE (IntelliJ IDEA hoac Eclipse)" -ForegroundColor White
    Write-Host "  2. Import project backend" -ForegroundColor White
    Write-Host "  3. Chay CourseManagementSystemApplication.java" -ForegroundColor White
    Write-Host ""
    Write-Host "HOAC cai dat Maven va chay:" -ForegroundColor Yellow
    Write-Host "  mvn spring-boot:run" -ForegroundColor White
    exit 1
}

Write-Host "✅ Tim thay Maven Wrapper" -ForegroundColor Green
Write-Host ""

# Kiểm tra MySQL connection
Write-Host "Dang kiem tra ket noi MySQL..." -ForegroundColor Yellow
$mysqlPath = "C:\Program Files\MySQL\MySQL Server 9.5\bin\mysql.exe"
if (Test-Path $mysqlPath) {
    $env:MYSQL_PWD = "27012003"
    $testConn = & $mysqlPath -u root -e "SELECT 1;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ MySQL da san sang" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Khong the ket noi MySQL" -ForegroundColor Yellow
    }
    Remove-Item Env:\MYSQL_PWD -ErrorAction SilentlyContinue
} else {
    Write-Host "⚠️  Khong tim thay MySQL (se thu ket noi khi khoi dong)" -ForegroundColor Yellow
}

Write-Host ""

# Kiểm tra port 8080
Write-Host "Dang kiem tra port 8080..." -ForegroundColor Yellow
$port8080 = netstat -an | Select-String ":8080"
if ($port8080) {
    Write-Host "⚠️  Port 8080 dang duoc su dung!" -ForegroundColor Yellow
    Write-Host "   Co the backend da dang chay hoac co ung dung khac" -ForegroundColor White
    Write-Host "   Ban co muon tiep tuc? (Y/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -ne "Y" -and $response -ne "y") {
        Write-Host "Da huy khoi dong" -ForegroundColor Red
        exit 0
    }
} else {
    Write-Host "✅ Port 8080 san sang" -ForegroundColor Green
}

Write-Host ""
Write-Host "Dang khoi dong backend..." -ForegroundColor Cyan
Write-Host "  (Co the mat 1-2 phut de compile va khoi dong)" -ForegroundColor Gray
Write-Host ""

# Chạy Maven Spring Boot
Set-Location $backendPath
& $mvnwPath spring-boot:run

