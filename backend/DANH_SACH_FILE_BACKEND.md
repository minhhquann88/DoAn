# Danh Sách File Backend - 3 Module Đồ Án

Tài liệu này liệt kê tất cả các file backend liên quan đến 3 module bạn phụ trách trong đồ án.

---

## 📋 MODULE 1: XÁC THỰC & QUẢN LÝ NGƯỜI DÙNG

### 🎯 Controller
- **`controller/AuthController.java`** - Xử lý đăng nhập, đăng ký, quên mật khẩu, reset mật khẩu
- **`controller/UserController.java`** - Quản lý profile người dùng (xem, cập nhật, đổi avatar, đổi mật khẩu)
- **`controller/AdminUserController.java`** - Quản lý người dùng cho Admin (xem danh sách, khóa/mở khóa tài khoản)

### 🔧 Service
- **`service/AuthService.java`** - Logic xử lý xác thực (login, register, forgot password, reset password, quản lý profile)
- **`service/AdminUserService.java`** - Logic quản lý người dùng cho Admin

### 🗄️ Model
- **`model/User.java`** - Entity người dùng (username, email, password, roles, profile info)
- **`model/Role.java`** - Entity vai trò (ADMIN, LECTURER, STUDENT)
- **`model/ERole.java`** - Enum định nghĩa các vai trò
- **`model/PasswordResetToken.java`** - Entity token reset mật khẩu

### 📦 Repository
- **`repository/UserRepository.java`** - Truy vấn database cho User
- **`repository/RoleRepository.java`** - Truy vấn database cho Role
- **`repository/PasswordResetTokenRepository.java`** - Truy vấn database cho PasswordResetToken

### 🔐 Security
- **`security/WebSecurityConfig.java`** - Cấu hình bảo mật Spring Security
- **`security/jwt/JwtUtils.java`** - Utility tạo và validate JWT token
- **`security/jwt/AuthTokenFilter.java`** - Filter xử lý JWT token trong request
- **`security/jwt/AuthEntryPointJwt.java`** - Xử lý lỗi xác thực
- **`security/services/UserDetailsServiceImpl.java`** - Load user từ database cho Spring Security
- **`security/services/UserDetailsImpl.java`** - Wrapper UserDetails cho Spring Security

### 📝 DTO (Data Transfer Object)
- **`dto/LoginRequest.java`** - Request đăng nhập
- **`dto/RegisterRequest.java`** - Request đăng ký
- **`dto/JwtResponse.java`** - Response sau khi đăng nhập (chứa JWT token)
- **`dto/ForgotPasswordRequest.java`** - Request quên mật khẩu
- **`dto/ResetPasswordRequest.java`** - Request reset mật khẩu
- **`dto/ProfileResponse.java`** - Response thông tin profile
- **`dto/UpdateProfileRequest.java`** - Request cập nhật profile
- **`dto/ChangePasswordRequest.java`** - Request đổi mật khẩu
- **`dto/AdminUserDTO.java`** - DTO quản lý user cho Admin
- **`dto/MessageResponse.java`** - Response message chung

---

## 📚 MODULE 2: QUẢN LÝ KHÓA HỌC & NỘI DUNG

### 🎯 Controller
- **`controller/CourseController.java`** - API quản lý khóa học (CRUD, upload ảnh, publish/unpublish)
- **`controller/AdminCourseController.java`** - API quản lý khóa học cho Admin
- **`controller/ChapterController.java`** - API quản lý chương (Chapter)
- **`controller/ContentAccessController.java`** - API truy cập nội dung khóa học cho học viên
- **`controller/CategoryController.java`** - API quản lý danh mục khóa học
- **`controller/AdminCategoryController.java`** - API quản lý danh mục cho Admin

### 🔧 Service
- **`service/CourseService.java`** - Logic quản lý khóa học (tạo, sửa, xóa, tìm kiếm, lọc, thống kê)
- **`service/ContentService.java`** - Logic quản lý nội dung (Chapter, Lesson, tiến độ học tập)
- **`service/FileStorageService.java`** - Service upload và lưu trữ file (ảnh, video, document)
- **`service/VideoDurationService.java`** - Service tính toán thời lượng video
- **`service/SlideConversionService.java`** - Service chuyển đổi slide (PPT/PPTX) sang PDF

### 🗄️ Model
- **`model/Course.java`** - Entity khóa học (title, description, price, status, instructor, category)
- **`model/Chapter.java`** - Entity chương (title, position, course)
- **`model/Lesson.java`** - Entity bài học (title, contentType, videoUrl, documentUrl, slideUrl, content, position)
- **`model/Category.java`** - Entity danh mục khóa học
- **`model/ECourseStatus.java`** - Enum trạng thái khóa học (DRAFT, PENDING_APPROVAL, PUBLISHED)
- **`model/EContentType.java`** - Enum loại nội dung (VIDEO, TEXT, DOCUMENT, YOUTUBE, SLIDE)

### 📦 Repository
- **`repository/CourseRepository.java`** - Truy vấn database cho Course
- **`repository/ChapterRepository.java`** - Truy vấn database cho Chapter
- **`repository/LessonRepository.java`** - Truy vấn database cho Lesson
- **`repository/CategoryRepository.java`** - Truy vấn database cho Category

### 📝 DTO
- **`dto/CourseRequest.java`** - Request tạo/cập nhật khóa học
- **`dto/CourseResponse.java`** - Response thông tin khóa học
- **`dto/ChapterRequest.java`** - Request tạo/cập nhật chương
- **`dto/ChapterResponse.java`** - Response thông tin chương
- **`dto/LessonRequest.java`** - Request tạo/cập nhật bài học
- **`dto/LessonResponse.java`** - Response thông tin bài học
- **`dto/CourseStatisticsResponse.java`** - Response thống kê khóa học
- **`dto/CourseAnalyticsResponse.java`** - Response phân tích khóa học

---

## 🎓 MODULE 3: HỌC TẬP & ĐÁNH GIÁ

### 🎯 Controller
- **`controller/EnrollmentController.java`** - API quản lý đăng ký khóa học (enrollment)
- **`controller/ReviewController.java`** - API đánh giá khóa học (tạo, xem, xóa, phản hồi)
- **`controller/CertificateController.java`** - API quản lý chứng chỉ (cấp, xem, download, verify)
- **`controller/ContentAccessController.java`** - API truy cập nội dung và theo dõi tiến độ

### 🔧 Service
- **`service/EnrollmentService.java`** - Logic quản lý đăng ký khóa học (tạo, cập nhật, xóa, thống kê)
- **`service/ContentService.java`** - Logic theo dõi tiến độ học tập (mark lesson completed, update watch time)
- **`service/ReviewService.java`** - Logic đánh giá khóa học (tạo, cập nhật, xóa, tính rating)
- **`service/CertificateService.java`** - Logic quản lý chứng chỉ (cấp, verify, download PDF)
- **`service/PdfGeneratorService.java`** - Service tạo PDF chứng chỉ
- **`service/StudentDashboardService.java`** - Service dashboard cho học viên

### 🗄️ Model
- **`model/Enrollment.java`** - Entity đăng ký khóa học (user, course, progress, status)
- **`model/User_Progress.java`** - Entity tiến độ học tập (enrollment, lesson, isCompleted, watchTime)
- **`model/Review.java`** - Entity đánh giá khóa học (user, course, rating, comment, instructorReply)
- **`model/Certificate.java`** - Entity chứng chỉ (enrollment, certificateCode, pdfUrl, issuedAt)
- **`model/EEnrollmentStatus.java`** - Enum trạng thái đăng ký (IN_PROGRESS, COMPLETED)

### 📦 Repository
- **`repository/EnrollmentRepository.java`** - Truy vấn database cho Enrollment
- **`repository/UserProgressRepository.java`** - Truy vấn database cho User_Progress
- **`repository/ReviewRepository.java`** - Truy vấn database cho Review
- **`repository/CertificateRepository.java`** - Truy vấn database cho Certificate

### 📝 DTO
- **`dto/EnrollmentDTO.java`** - Response thông tin đăng ký
- **`dto/EnrollmentCreateRequest.java`** - Request tạo đăng ký
- **`dto/EnrollmentUpdateRequest.java`** - Request cập nhật đăng ký
- **`dto/StudentLearningHistoryDTO.java`** - Response lịch sử học tập của học viên
- **`dto/MonthlyStudentStatsDTO.java`** - Response thống kê học viên theo tháng
- **`dto/ReviewDTO.java`** - Response thông tin đánh giá
- **`dto/ReviewRequest.java`** - Request tạo/cập nhật đánh giá
- **`dto/CourseRatingDTO.java`** - Response thông tin rating tổng hợp
- **`dto/CertificateDTO.java`** - Response thông tin chứng chỉ
- **`dto/CertificateRequest.java`** - Request cấp chứng chỉ

---

## 🔗 CÁC FILE HỖ TRỢ CHUNG

### ⚙️ Config
- **`config/WebMvcConfig.java`** - Cấu hình Spring MVC (CORS, static resources)
- **`config/DataLoader.java`** - Load dữ liệu mặc định khi khởi động

### 🚨 Exception Handling
- **`exception/GlobalExceptionHandler.java`** - Xử lý exception toàn cục
- **`exception/ResourceNotFoundException.java`** - Exception khi không tìm thấy resource

### 📧 Email Service
- **`service/EmailService.java`** - Service gửi email (forgot password, notifications)

### 📄 File Storage
- **`service/FileStorageService.java`** - Service upload và quản lý file

---

## 📖 HƯỚNG DẪN HỌC TẬP

### 1. Bắt đầu với Module 1 (Xác thực & Quản lý Người dùng)
- Đọc `model/User.java` và `model/Role.java` để hiểu cấu trúc dữ liệu
- Xem `controller/AuthController.java` để hiểu các API endpoint
- Nghiên cứu `service/AuthService.java` để hiểu logic xử lý
- Tìm hiểu JWT trong `security/jwt/JwtUtils.java`

### 2. Tiếp tục với Module 2 (Quản lý Khóa học & Nội dung)
- Đọc `model/Course.java`, `model/Chapter.java`, `model/Lesson.java`
- Xem `controller/CourseController.java` và `service/CourseService.java`
- Nghiên cứu `service/ContentService.java` để hiểu cách quản lý nội dung

### 3. Cuối cùng là Module 3 (Học tập & Đánh giá)
- Đọc `model/Enrollment.java`, `model/User_Progress.java`, `model/Review.java`, `model/Certificate.java`
- Xem `controller/EnrollmentController.java` và `service/EnrollmentService.java`
- Nghiên cứu `service/ContentService.java` (phần theo dõi tiến độ)
- Xem `service/ReviewService.java` và `service/CertificateService.java`

### 4. Tìm hiểu các khái niệm quan trọng
- **Spring Security & JWT**: Xác thực và phân quyền
- **JPA/Hibernate**: ORM mapping và truy vấn database
- **DTO Pattern**: Chuyển đổi giữa Entity và DTO
- **Service Layer**: Business logic tách biệt khỏi Controller
- **Repository Pattern**: Truy cập database
- **Transaction Management**: `@Transactional` annotation

---

## 💡 LƯU Ý QUAN TRỌNG

1. **Security**: Tất cả API đều được bảo vệ bởi Spring Security, kiểm tra `@PreAuthorize` trong Controller
2. **Transaction**: Các thao tác database quan trọng đều có `@Transactional`
3. **Exception Handling**: Xem `GlobalExceptionHandler.java` để hiểu cách xử lý lỗi
4. **DTO Pattern**: Luôn sử dụng DTO để tránh expose Entity trực tiếp
5. **Lazy Loading**: Cẩn thận với LazyInitializationException khi truy cập quan hệ

---

**Chúc bạn học tập tốt! 🚀**

