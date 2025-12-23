# PowerShell Script để xóa các bảng Test/Quiz từ MySQL
# Database: coursemgmt_test
# User: root
# Password: 27012003

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "XÓA CÁC BẢNG TEST/QUIZ TỪ DATABASE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Thông tin kết nối
$database = "coursemgmt_test"
$username = "root"
$password = "27012003"
$host = "localhost"
$port = "3306"

Write-Host "Database: $database" -ForegroundColor Yellow
Write-Host "Host: $host:$port" -ForegroundColor Yellow
Write-Host "User: $username" -ForegroundColor Yellow
Write-Host ""

# Kiểm tra MySQL có đang chạy không
Write-Host "Đang kiểm tra kết nối MySQL..." -ForegroundColor Green
$testConnection = mysql -u $username -p$password -h $host -P $port -e "SELECT 1" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Không thể kết nối đến MySQL!" -ForegroundColor Red
    Write-Host "Vui lòng đảm bảo MySQL đang chạy và thông tin đăng nhập đúng." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Kết nối MySQL thành công!" -ForegroundColor Green
Write-Host ""

# Kiểm tra các bảng test có tồn tại không
Write-Host "Đang kiểm tra các bảng test..." -ForegroundColor Green
$tables = mysql -u $username -p$password -h $host -P $port $database -e "SHOW TABLES LIKE 'test%';" 2>&1

if ($tables -match "test") {
    Write-Host "Tìm thấy các bảng test:" -ForegroundColor Yellow
    $tables | Select-String "test" | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }
    Write-Host ""
    
    # Xác nhận xóa
    $confirm = Read-Host "Bạn có chắc chắn muốn xóa các bảng này? (yes/no)"
    if ($confirm -ne "yes") {
        Write-Host "Đã hủy thao tác." -ForegroundColor Yellow
        exit 0
    }
    
    Write-Host ""
    Write-Host "Đang xóa các bảng..." -ForegroundColor Green
    
    # Đọc và chạy SQL script
    $sqlScript = Get-Content -Path "$PSScriptRoot\remove_test_tables.sql" -Raw
    $result = mysql -u $username -p$password -h $host -P $port $database -e $sqlScript 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Đã xóa các bảng test thành công!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Danh sách tables còn lại:" -ForegroundColor Cyan
        mysql -u $username -p$password -h $host -P $port $database -e "SHOW TABLES;" 2>&1
    } else {
        Write-Host "❌ Có lỗi xảy ra khi xóa bảng:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
    }
} else {
    Write-Host "✅ Không tìm thấy bảng test nào. Có thể đã được xóa trước đó." -ForegroundColor Green
}

Write-Host ""
Write-Host "Hoàn tất!" -ForegroundColor Cyan

