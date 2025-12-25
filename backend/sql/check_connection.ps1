# ============================================
# Script kiểm tra kết nối MySQL
# ============================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "KIEM TRA KET NOI MYSQL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$username = "root"
$password = "27012003"
$database = "coursemgmt_test"
$mysqlHost = "localhost"
$port = "3306"

Write-Host "Thong tin ket noi:" -ForegroundColor Yellow
Write-Host "  Host: ${mysqlHost}:$port" -ForegroundColor White
Write-Host "  Username: $username" -ForegroundColor White
Write-Host "  Database: $database" -ForegroundColor White
Write-Host ""

# Tìm MySQL path
$mysqlPaths = @(
    "mysql",
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 8.1\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 8.2\bin\mysql.exe",
    "C:\xampp\mysql\bin\mysql.exe",
    "C:\wamp64\bin\mysql\mysql8.0.xx\bin\mysql.exe",
    "C:\wamp\bin\mysql\mysql8.0.xx\bin\mysql.exe"
)

$mysqlPath = $null
foreach ($path in $mysqlPaths) {
    if ($path -eq "mysql") {
        try {
            $null = Get-Command mysql -ErrorAction Stop
            $mysqlPath = "mysql"
            break
        } catch {
            continue
        }
    } else {
        if (Test-Path $path) {
            $mysqlPath = $path
            break
        }
    }
}

if (-not $mysqlPath) {
    Write-Host "❌ Khong tim thay MySQL!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Cac cach kiem tra khac:" -ForegroundColor Yellow
    Write-Host "  1. Kiem tra MySQL service co dang chay:" -ForegroundColor White
    Write-Host "     - Mo Services (services.msc)" -ForegroundColor Gray
    Write-Host "     - Tim 'MySQL' va kiem tra status" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  2. Kiem tra port 3306:" -ForegroundColor White
    Write-Host "     netstat -an | findstr 3306" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  3. Thu ket noi bang MySQL Workbench hoac phpMyAdmin" -ForegroundColor White
    exit 1
}

Write-Host "✅ Tim thay MySQL: $mysqlPath" -ForegroundColor Green
Write-Host ""

# Kiểm tra MySQL service có chạy không
Write-Host "Dang kiem tra MySQL service..." -ForegroundColor Yellow
$mysqlService = Get-Service -Name "*mysql*" -ErrorAction SilentlyContinue
if ($mysqlService) {
    $running = $mysqlService | Where-Object { $_.Status -eq "Running" }
    if ($running) {
        Write-Host "✅ MySQL service dang chay" -ForegroundColor Green
    } else {
        Write-Host "⚠️  MySQL service chua chay!" -ForegroundColor Yellow
        Write-Host "   Dang thu khoi dong..." -ForegroundColor Yellow
        try {
            $mysqlService | Start-Service -ErrorAction Stop
            Write-Host "✅ Da khoi dong MySQL service" -ForegroundColor Green
            Start-Sleep -Seconds 3
        } catch {
            Write-Host "❌ Khong the khoi dong MySQL service" -ForegroundColor Red
            Write-Host "   Vui long khoi dong thu cong" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "⚠️  Khong tim thay MySQL service (co the la XAMPP/WAMP)" -ForegroundColor Yellow
}

Write-Host ""

# Kiểm tra port 3306
Write-Host "Dang kiem tra port 3306..." -ForegroundColor Yellow
$portCheck = netstat -an | Select-String "3306"
if ($portCheck) {
    Write-Host "✅ Port 3306 dang mo" -ForegroundColor Green
} else {
    Write-Host "⚠️  Port 3306 chua mo (MySQL co the chua chay)" -ForegroundColor Yellow
}

Write-Host ""

# Test kết nối MySQL
Write-Host "Dang thu ket noi MySQL..." -ForegroundColor Yellow
$env:MYSQL_PWD = $password

try {
    # Test kết nối cơ bản
    $testQuery = "SELECT 1 as test;"
    $result = & $mysqlPath -u $username -e $testQuery 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Ket noi MySQL thanh cong!" -ForegroundColor Green
        Write-Host ""
        
        # Kiểm tra database
        Write-Host "Dang kiem tra database '$database'..." -ForegroundColor Yellow
        $dbCheck = & $mysqlPath -u $username -e "SHOW DATABASES LIKE '$database';" 2>&1
        
        if ($dbCheck -match $database) {
            Write-Host "✅ Database '$database' da ton tai!" -ForegroundColor Green
            Write-Host ""
            
            # Đếm số bảng
            $tables = & $mysqlPath -u $username -D $database -e "SHOW TABLES;" 2>&1
            $tableList = $tables | Select-Object -Skip 1 | Where-Object { $_ -match '\S' }
            $tableCount = ($tableList | Measure-Object).Count
            
            Write-Host "So bang trong database: $tableCount" -ForegroundColor Cyan
            Write-Host ""
            
            if ($tableCount -gt 0) {
                Write-Host "Danh sach bang:" -ForegroundColor Yellow
                $tableList | ForEach-Object {
                    Write-Host "  ✅ $_" -ForegroundColor Green
                }
                Write-Host ""
                
                # Đếm số bản ghi trong các bảng chính
                Write-Host "So ban ghi trong cac bang chinh:" -ForegroundColor Yellow
                $tablesToCheck = @("users", "courses", "enrollments", "transactions", "certificates")
                foreach ($table in $tablesToCheck) {
                    $count = & $mysqlPath -u $username -D $database -e "SELECT COUNT(*) as count FROM $table;" 2>&1 | Select-String -Pattern "\d+" | ForEach-Object { $_.Matches.Value }
                    if ($count) {
                        Write-Host "  - $table`: $count ban ghi" -ForegroundColor White
                    }
                }
            } else {
                Write-Host "⚠️  Database chua co bang nao!" -ForegroundColor Yellow
                Write-Host "   Chay script SQL de tao database:" -ForegroundColor Cyan
                Write-Host "   mysql -u root -p27012003 < backend/sql/create_test_database.sql" -ForegroundColor Gray
            }
        } else {
            Write-Host "⚠️  Database '$database' chua duoc tao!" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Chay script SQL de tao database:" -ForegroundColor Cyan
            Write-Host "  mysql -u root -p27012003 < backend/sql/create_test_database.sql" -ForegroundColor Gray
            Write-Host ""
            Write-Host "HOAC su dung MySQL Workbench:" -ForegroundColor Cyan
            Write-Host "  - Mo MySQL Workbench" -ForegroundColor Gray
            Write-Host "  - File > Open SQL Script > chon create_test_database.sql" -ForegroundColor Gray
            Write-Host "  - Execute (F5)" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ Ket noi MySQL that bai!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Kiem tra lai:" -ForegroundColor Yellow
        Write-Host "  - MySQL service da chay chua?" -ForegroundColor White
        Write-Host "  - Username/Password dung chua? (root / 27012003)" -ForegroundColor White
        Write-Host "  - Port 3306 co bi block khong?" -ForegroundColor White
    }
} catch {
    Write-Host "❌ LOI: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Kiem tra:" -ForegroundColor Yellow
    Write-Host "  - MySQL da duoc cai dat chua?" -ForegroundColor White
    Write-Host "  - MySQL service co dang chay khong?" -ForegroundColor White
}

Remove-Item Env:\MYSQL_PWD -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

