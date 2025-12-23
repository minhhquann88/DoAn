# 🔧 Sửa Lỗi Type Mismatch: feedback_rating

## ❌ Lỗi

```
Schema-validation: wrong column type encountered in column [feedback_rating] in table [chat_messages]; 
found [tinyint unsigned (Types#TINYINT)], but expecting [integer (Types#INTEGER)]
```

## 🔍 Nguyên nhân

- Database schema có `feedback_rating TINYINT UNSIGNED`
- Hibernate map `Integer` Java type thành `INTEGER` SQL type
- Khi dùng `validate` mode, Hibernate kiểm tra type phải match chính xác

## ✅ Giải pháp

### Cách 1: Sửa Database (Đã áp dụng)

Chạy script SQL để đổi type:

```sql
USE coursemgmt_optimized;

ALTER TABLE chat_messages 
MODIFY COLUMN feedback_rating INT CHECK (feedback_rating BETWEEN 1 AND 5);
```

Hoặc chạy file:
```bash
mysql -u root -p27012003 < backend/sql/fix_feedback_rating_type.sql
```

### Cách 2: Sửa Model (Không khuyến khích)

Nếu muốn giữ `TINYINT UNSIGNED` trong database, có thể dùng:

```java
@Column(name = "feedback_rating", columnDefinition = "TINYINT UNSIGNED")
private Integer feedbackRating;
```

Nhưng cách này có thể gây vấn đề với validation mode.

## 📝 Files đã sửa

1. ✅ `backend/sql/create_optimized_database.sql` - Đổi `TINYINT UNSIGNED` → `INT`
2. ✅ `backend/sql/fix_feedback_rating_type.sql` - Script để fix database hiện tại
3. ✅ `backend/src/main/java/com/coursemgmt/model/Chat_Message.java` - Model đã đúng

## 🚀 Cách chạy

1. **Nếu database chưa tạo:**
   - Chạy lại `create_optimized_database.sql` (đã được sửa)

2. **Nếu database đã tạo:**
   - Chạy `fix_feedback_rating_type.sql`:
   ```bash
   mysql -u root -p27012003 < backend/sql/fix_feedback_rating_type.sql
   ```

3. **Restart backend:**
   ```bash
   cd backend
   .\mvnw.cmd spring-boot:run
   ```

## ✅ Kết quả mong đợi

- Backend start thành công
- Không còn lỗi schema validation
- `feedback_rating` column type là `INT`

---

**Hoàn tất!** 🎉

