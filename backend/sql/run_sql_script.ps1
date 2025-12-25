# ============================================
# Script PowerShell để chạy SQL script
# Tạo database MySQL cho test
# ============================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TAO DATABASE MYSQL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$mysqlPath = "mysql"
$username = "root"
$password = "27012003"
$scriptPath = Join-Path $PSScriptRoot "create_test_database.sql"

# Kiểm tra file SQL có tồn tại không
if (-not (Test-Path $scriptPath)) {
    Write-Host "LOI: Khong tim thay file SQL!" -ForegroundColor Red
    Write-Host "Duong dan: $scriptPath" -ForegroundColor Yellow
    exit 1
}

Write-Host "Thong tin ket noi:" -ForegroundColor Yellow
Write-Host "  Username: $username" -ForegroundColor White
Write-Host "  Database: coursemgmt_test" -ForegroundColor White
Write-Host "  Script: $scriptPath" -ForegroundColor White
Write-Host ""

# Kiểm tra MySQL có sẵn không
try {
    $mysqlVersion = & $mysqlPath --version 2>&1
    Write-Host "MySQL da san sang: $mysqlVersion" -ForegroundColor Green
} catch {
    Write-Host "LOI: Khong tim thay MySQL!" -ForegroundColor Red
    Write-Host "Vui long cai dat MySQL hoac them MySQL vao PATH" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Dang chay script SQL..." -ForegroundColor Cyan

# Chạy script SQL
$env:MYSQL_PWD = $password
$command = "& `"$mysqlPath`" -u $username -p$password < `"$scriptPath`""

try {
    # Sử dụng Get-Content và pipe vào mysql
    Get-Content $scriptPath | & $mysqlPath -u $username -p$password 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "TAO DATABASE THANH CONG!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Database: coursemgmt_test" -ForegroundColor Cyan
        Write-Host "Co the bat dau test cac module!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "LOI: Co loi khi chay script SQL" -ForegroundColor Red
        Write-Host "Kiem tra lai thong tin ket noi MySQL" -ForegroundColor Yellow
    }
} catch {
    Write-Host ""
    Write-Host "LOI: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "CACH KHAC: Chay thu cong:" -ForegroundColor Yellow
    Write-Host "  mysql -u root -p27012003 < backend/sql/create_test_database.sql" -ForegroundColor White
}

# Xóa password khỏi environment
Remove-Item Env:\MYSQL_PWD -ErrorAction SilentlyContinue

Write-Host ""

