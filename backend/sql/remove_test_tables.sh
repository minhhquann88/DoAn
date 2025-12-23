#!/bin/bash

# Bash Script để xóa các bảng Test/Quiz từ MySQL
# Database: coursemgmt_test
# User: root
# Password: 27012003

echo "========================================"
echo "XÓA CÁC BẢNG TEST/QUIZ TỪ DATABASE"
echo "========================================"
echo ""

# Thông tin kết nối
DATABASE="coursemgmt_test"
USERNAME="root"
PASSWORD="27012003"
HOST="localhost"
PORT="3306"

echo "Database: $DATABASE"
echo "Host: $HOST:$PORT"
echo "User: $USERNAME"
echo ""

# Kiểm tra MySQL có đang chạy không
echo "Đang kiểm tra kết nối MySQL..."
mysql -u "$USERNAME" -p"$PASSWORD" -h "$HOST" -P "$PORT" -e "SELECT 1" > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Không thể kết nối đến MySQL!"
    echo "Vui lòng đảm bảo MySQL đang chạy và thông tin đăng nhập đúng."
    exit 1
fi

echo "✅ Kết nối MySQL thành công!"
echo ""

# Kiểm tra các bảng test có tồn tại không
echo "Đang kiểm tra các bảng test..."
TABLES=$(mysql -u "$USERNAME" -p"$PASSWORD" -h "$HOST" -P "$PORT" "$DATABASE" -e "SHOW TABLES LIKE 'test%';" 2>&1)

if echo "$TABLES" | grep -q "test"; then
    echo "Tìm thấy các bảng test:"
    echo "$TABLES" | grep "test" | sed 's/^/  - /'
    echo ""
    
    # Xác nhận xóa
    read -p "Bạn có chắc chắn muốn xóa các bảng này? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "Đã hủy thao tác."
        exit 0
    fi
    
    echo ""
    echo "Đang xóa các bảng..."
    
    # Chạy SQL script
    mysql -u "$USERNAME" -p"$PASSWORD" -h "$HOST" -P "$PORT" "$DATABASE" < "$(dirname "$0")/remove_test_tables.sql"
    
    if [ $? -eq 0 ]; then
        echo "✅ Đã xóa các bảng test thành công!"
        echo ""
        echo "Danh sách tables còn lại:"
        mysql -u "$USERNAME" -p"$PASSWORD" -h "$HOST" -P "$PORT" "$DATABASE" -e "SHOW TABLES;"
    else
        echo "❌ Có lỗi xảy ra khi xóa bảng"
        exit 1
    fi
else
    echo "✅ Không tìm thấy bảng test nào. Có thể đã được xóa trước đó."
fi

echo ""
echo "Hoàn tất!"

