# ============================================
# Script test kết nối MySQL
# ============================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST KET NOI MYSQL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$mysqlPath = "mysql"
$username = "root"
$password = "27012003"
$database = "coursemgmt_test"

# Test kết nối
Write-Host "Dang kiem tra ket noi MySQL..." -ForegroundColor Yellow
Write-Host "  Host: localhost:3306" -ForegroundColor White
Write-Host "  Username: $username" -ForegroundColor White
Write-Host "  Database: $database" -ForegroundColor White
Write-Host ""

$env:MYSQL_PWD = $password

try {
    # Test kết nối cơ bản
    $result = & $mysqlPath -u $username -e "SELECT 1;" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Ket noi MySQL thanh cong!" -ForegroundColor Green
        Write-Host ""
        
        # Kiểm tra database có tồn tại không
        Write-Host "Dang kiem tra database..." -ForegroundColor Yellow
        $dbCheck = & $mysqlPath -u $username -e "SHOW DATABASES LIKE '$database';" 2>&1
        
        if ($dbCheck -match $database) {
            Write-Host "✅ Database '$database' da ton tai!" -ForegroundColor Green
            Write-Host ""
            
            # Đếm số bảng
            $tableCount = & $mysqlPath -u $username -D $database -e "SHOW TABLES;" 2>&1 | Select-Object -Skip 1 | Measure-Object -Line
            Write-Host "So bang trong database: $($tableCount.Lines)" -ForegroundColor Cyan
            
            # Liệt kê các bảng
            Write-Host ""
            Write-Host "Cac bang:" -ForegroundColor Yellow
            & $mysqlPath -u $username -D $database -e "SHOW TABLES;" 2>&1 | Select-Object -Skip 1 | ForEach-Object {
                Write-Host "  - $_" -ForegroundColor White
            }
        } else {
            Write-Host "⚠️  Database '$database' chua duoc tao!" -ForegroundColor Yellow
            Write-Host "Chay script: backend/sql/run_sql_script.ps1" -ForegroundColor Cyan
        }
    } else {
        Write-Host "❌ Ket noi MySQL that bai!" -ForegroundColor Red
        Write-Host "Kiem tra lai:" -ForegroundColor Yellow
        Write-Host "  - MySQL da chay chua?" -ForegroundColor White
        Write-Host "  - Username/Password dung chua?" -ForegroundColor White
        Write-Host "  - Port 3306 co bi block khong?" -ForegroundColor White
    }
} catch {
    Write-Host "❌ LOI: $($_.Exception.Message)" -ForegroundColor Red
}

Remove-Item Env:\MYSQL_PWD -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

