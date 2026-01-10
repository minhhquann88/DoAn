# LUỒNG HOẠT ĐỘNG MODULE HỌC TẬP & ĐÁNH GIÁ

## KỊCH BẢN 1: GHI DANH (FREE HOẶC ĐÃ THANH TOÁN XONG)

### 1. Điểm bắt đầu: EnrollmentController.java
- Client gửi request POST tới `/api/v1/enrollments`
- Request body là đối tượng `EnrollmentCreateRequest` (đã được validate bởi `@Valid`)
- Không yêu cầu quyền đặc biệt (public endpoint)

### 2. Xử lý nghiệp vụ: EnrollmentService.createEnrollment()
- **Kiểm tra và lấy Student:**
  - Gọi `userRepository.findById(request.getStudentId())` để tìm User theo ID
  - Nếu không tìm thấy → throw RuntimeException("Student not found with id: " + request.getStudentId())
  
- **Kiểm tra và lấy Course:**
  - Gọi `courseRepository.findById(request.getCourseId())` để tìm Course theo ID
  - Nếu không tìm thấy → throw RuntimeException("Course not found with id: " + request.getCourseId())
  
- **Kiểm tra trùng lặp:**
  - Gọi `enrollmentRepository.findByUserIdAndCourseId(request.getStudentId(), request.getCourseId())` để kiểm tra học viên đã đăng ký khóa học này chưa
  - Nếu đã tồn tại → throw RuntimeException("Student already enrolled in this course")
  
- **Tạo đối tượng Enrollment mới:**
  - Tạo instance `Enrollment enrollment = new Enrollment()`
  - Set quan hệ:
    - `enrollment.setUser(student)` - Gán học viên cho enrollment
    - `enrollment.setCourse(course)` - Gán khóa học cho enrollment
  - Set giá trị mặc định:
    - `enrollment.setProgress(0.0)` - Tiến độ ban đầu là 0%
    - `enrollment.setStatus(EEnrollmentStatus.IN_PROGRESS)` - Trạng thái ban đầu là đang học
    - `enrollment.setEnrolledAt(LocalDateTime.now())` - Thời gian đăng ký
  
- **Lưu xuống Database:**
  - Gọi `enrollmentRepository.save(enrollment)` để lưu Enrollment vào database
  
- **Trả về kết quả:**
  - Controller nhận Enrollment đã lưu
  - Convert sang `EnrollmentDTO` bằng `convertToDTO(enrollment)`
  - Trả về ResponseEntity với status 200 (OK)

**Lưu ý:** Ghi danh có thể được tạo tự động sau khi thanh toán thành công thông qua `PaymentService.createSingleEnrollment()` hoặc trực tiếp cho khóa học miễn phí (price = 0).

---

## KỊCH BẢN 2: HỌC BÀI

### 1. Điểm bắt đầu: ContentAccessController.java
- Client gửi request GET tới `/api/content/courses/{courseId}`
- Yêu cầu phải đã đăng nhập (được kiểm tra bởi `@PreAuthorize("isAuthenticated()")`)
- Học viên phải đã đăng ký khóa học (kiểm tra trong service)

### 2. Xử lý nghiệp vụ: ContentService.getCourseContent()
- **Lấy thông tin người dùng hiện tại:**
  - Lấy `UserDetailsImpl` từ `@AuthenticationPrincipal`
  - Gọi `userRepository.findById(userDetails.getId())` để lấy đối tượng `User`
  
- **Kiểm tra và lấy Course:**
  - Gọi `courseRepository.findById(courseId)` để tìm Course theo ID
  - Nếu không tìm thấy → throw RuntimeException("Course not found!")
  
- **Kiểm tra quyền truy cập:**
  - Kiểm tra user có phải ADMIN không
  - Kiểm tra user có phải giảng viên của khóa học không (`course.getInstructor().getId().equals(userId)`)
  - Nếu không phải ADMIN và không phải giảng viên:
    - Gọi `enrollmentRepository.findByUserAndCourse(user, course)` để kiểm tra đã đăng ký chưa
    - Nếu chưa đăng ký → throw RuntimeException("Bạn chưa đăng ký khóa học này!")
  
- **Lấy danh sách chương:**
  - Gọi `chapterRepository.findByCourseIdOrderByPositionAsc(courseId)` để lấy danh sách chương theo thứ tự
  
- **Lấy thông tin tiến độ học tập:**
  - Tìm Enrollment của user cho khóa học này
  - Gọi `userProgressRepository.findByEnrollmentWithLesson(enrollment)` để lấy tất cả User_Progress
  - Tạo Set các lesson ID đã hoàn thành từ User_Progress
  
- **Xử lý từng chương:**
  - Duyệt qua từng chương trong danh sách
  - Với mỗi chương:
    - Lấy danh sách bài học: `chapter.getLessons()` và sắp xếp theo position
    - Duyệt qua từng bài học:
      - Kiểm tra bài học đã hoàn thành chưa (dựa vào Set completedLessonIds)
      - Kiểm tra bài học có bị khóa không:
        - Bài học đầu tiên của chương đầu tiên → không khóa
        - Bài học khác → kiểm tra bài học trước đó đã hoàn thành chưa
        - Nếu là bài học đầu tiên của chương (không phải chương đầu) → kiểm tra bài học cuối của chương trước đã hoàn thành chưa
      - Tạo `LessonResponse` với thông tin `isCompleted` và `isLocked`
    - Tạo `ChapterResponse` với danh sách bài học
  
- **Trả về kết quả:**
  - Controller nhận danh sách `ChapterResponse`
  - Trả về ResponseEntity với status 200 (OK)

---

## KỊCH BẢN 3: CẬP NHẬT TIẾN ĐỘ

### 3.1. Đánh dấu bài học đã hoàn thành (Manual)

#### 1. Điểm bắt đầu: ContentAccessController.java
- Client gửi request POST tới `/api/content/lessons/{lessonId}/complete`
- Yêu cầu phải có quyền STUDENT và đã đăng ký khóa học (được kiểm tra bởi `@PreAuthorize("hasRole('STUDENT') and @courseSecurityService.isEnrolled(authentication, #lessonId)")`)

#### 2. Xử lý nghiệp vụ: ContentService.markLessonAsCompleted()
- **Lấy thông tin người dùng:**
  - Gọi `userRepository.findById(userDetails.getId())` để lấy đối tượng `User`
  - Nếu không tìm thấy → throw RuntimeException("Không tìm thấy người dùng!")
  
- **Kiểm tra và lấy Lesson:**
  - Gọi `lessonRepository.findById(lessonId)` để tìm Lesson theo ID
  - Nếu không tìm thấy → throw RuntimeException("Không tìm thấy bài học với ID: " + lessonId)
  
- **Kiểm tra quan hệ Lesson-Chapter-Course:**
  - Lấy `Chapter chapter = lesson.getChapter()`
  - Nếu chapter == null → throw RuntimeException("Bài học chưa được gán vào chương nào!")
  - Lấy `Course course = chapter.getCourse()`
  - Nếu course == null → throw RuntimeException("Chương chưa được gán vào khóa học nào!")
  
- **Kiểm tra Enrollment:**
  - Gọi `enrollmentRepository.findByUserAndCourse(user, course)` để tìm Enrollment
  - Nếu không tìm thấy → throw RuntimeException("Bạn chưa đăng ký khóa học này!")
  
- **Tạo hoặc cập nhật User_Progress:**
  - Gọi `userProgressRepository.findByEnrollmentAndLesson(enrollment, lesson)` để tìm User_Progress
  - Nếu không tìm thấy → tạo mới `User_Progress()`
  - Set thông tin:
    - `progress.setEnrollment(enrollment)`
    - `progress.setLesson(lesson)`
    - `progress.setIsCompleted(true)` - Đánh dấu đã hoàn thành
    - `progress.setCompletedAt(LocalDateTime.now())` - Thời gian hoàn thành
  - Gọi `userProgressRepository.save(progress)` để lưu
  
- **Cập nhật tiến độ Enrollment:**
  - Gọi `updateEnrollmentProgress(enrollment)` để tính toán lại tiến độ tổng thể
  
- **Trả về kết quả:**
  - Controller trả về ResponseEntity với message "Lesson marked as completed!"
  - Status code 200 (OK)

### 3.2. Cập nhật tiến độ xem video (Auto-Progress)

#### 1. Điểm bắt đầu: ContentAccessController.java
- Client gửi request POST tới `/api/content/lessons/{lessonId}/progress`
- Yêu cầu phải có quyền STUDENT và đã đăng ký khóa học (được kiểm tra bởi `@PreAuthorize("hasRole('STUDENT') and @courseSecurityService.isEnrolled(authentication, #lessonId)")`)
- Request body là đối tượng `LessonProgressRequest` (đã được validate bởi `@Valid`)
  - `watchedTime`: Thời gian đã xem (giây)
  - `totalDuration`: Tổng thời lượng video (giây)

#### 2. Xử lý nghiệp vụ: ContentService.updateLessonWatchTime()
- **Lấy thông tin người dùng:**
  - Gọi `userRepository.findById(userDetails.getId())` để lấy đối tượng `User`
  - Nếu không tìm thấy → throw RuntimeException("User not found!")
  
- **Kiểm tra và lấy Lesson:**
  - Gọi `lessonRepository.findById(lessonId)` để tìm Lesson theo ID
  - Nếu không tìm thấy → throw RuntimeException("Lesson not found!")
  - Lấy Course từ `lesson.getChapter().getCourse()`
  
- **Kiểm tra Enrollment:**
  - Gọi `enrollmentRepository.findByUserAndCourse(user, course)` để tìm Enrollment
  - Nếu không tìm thấy → throw RuntimeException("Bạn chưa đăng ký khóa học này!")
  
- **Tạo hoặc cập nhật User_Progress:**
  - Gọi `userProgressRepository.findByEnrollmentAndLesson(enrollment, lesson)` để tìm User_Progress
  - Nếu không tìm thấy → tạo mới `User_Progress()`
  - Nếu progress chưa có enrollment và lesson → set:
    - `progress.setEnrollment(enrollment)`
    - `progress.setLesson(lesson)`
  - Cập nhật thời gian xem:
    - `progress.setLastWatchedTime(watchedTime)` - Thời gian đã xem
    - `progress.setTotalDuration(totalDuration)` - Tổng thời lượng
  
- **Tự động đánh dấu hoàn thành (Auto-Complete):**
  - Tính phần trăm đã xem: `percent = (double) watchedTime / totalDuration`
  - Nếu `percent >= 0.9` (đã xem >= 90%) và chưa đánh dấu hoàn thành:
    - `progress.setIsCompleted(true)`
    - `progress.setCompletedAt(LocalDateTime.now())`
    - Gọi `updateEnrollmentProgress(enrollment)` để cập nhật tiến độ tổng thể
  
- **Lưu User_Progress:**
  - Gọi `userProgressRepository.save(progress)` để lưu
  
- **Trả về kết quả:**
  - Controller trả về ResponseEntity với message "Progress updated successfully!"
  - Status code 200 (OK)

### 3.3. Tính toán lại tiến độ Enrollment: ContentService.updateEnrollmentProgress()
- **Đếm tổng số bài học:**
  - Gọi `lessonRepository.countByChapter_Course_Id(enrollment.getCourse().getId())` để đếm tổng số bài học trong khóa học
  - Nếu totalLessonsInCourse == 0:
    - Set `enrollment.setProgress(100.0)`
    - Set `enrollment.setStatus(EEnrollmentStatus.COMPLETED)`
    - Lưu enrollment
    - Gọi `autoIssueCertificate(enrollment)` để tự động cấp chứng chỉ
    - Return
  
- **Đếm số bài học đã hoàn thành:**
  - Gọi `userProgressRepository.countByEnrollmentAndIsCompleted(enrollment, true)` để đếm số bài học đã hoàn thành
  
- **Tính phần trăm tiến độ:**
  - `progressPercentage = (completedLessons / totalLessonsInCourse) * 100.0`
  - Làm tròn đến 2 chữ số thập phân: `Math.round(progressPercentage * 100.0) / 100.0`
  
- **Cập nhật Enrollment:**
  - `enrollment.setProgress(progressPercentage)`
  - Nếu `progressPercentage >= 100.0`:
    - `enrollment.setStatus(EEnrollmentStatus.COMPLETED)` - Đánh dấu đã hoàn thành
    - Lưu enrollment
    - Gọi `autoIssueCertificate(enrollment)` để tự động cấp chứng chỉ
  - Nếu không:
    - `enrollment.setStatus(EEnrollmentStatus.IN_PROGRESS)` - Vẫn đang học
    - Lưu enrollment

---

## KỊCH BẢN 4: NHẬN VÀ TẢI CHỨNG CHỈ

### 4.1. Tự động cấp chứng chỉ khi hoàn thành khóa học

#### 1. Điểm bắt đầu: ContentService.autoIssueCertificate()
- Được gọi tự động từ `updateEnrollmentProgress()` khi `progressPercentage >= 100.0`

#### 2. Xử lý nghiệp vụ: ContentService.autoIssueCertificate()
- **Kiểm tra chứng chỉ đã tồn tại:**
  - Gọi `certificateService.existsByEnrollmentId(enrollment.getId())` để kiểm tra
  - Nếu đã tồn tại → return (không cấp lại)
  
- **Tạo CertificateRequest:**
  - Tạo instance `CertificateRequest certRequest = new CertificateRequest()`
  - Set `certRequest.setEnrollmentId(enrollment.getId())`
  
- **Cấp chứng chỉ:**
  - Gọi `certificateService.issueCertificate(certRequest)` để cấp chứng chỉ
  - Nếu có lỗi → chỉ log, không throw exception (để không ảnh hưởng đến việc cập nhật tiến độ)

### 4.2. Cấp chứng chỉ thủ công

#### 1. Điểm bắt đầu: CertificateController.java
- Client gửi request POST tới `/api/v1/certificates`
- Request body là đối tượng `CertificateRequest` (đã được validate bởi `@Valid`)

#### 2. Xử lý nghiệp vụ: CertificateService.issueCertificate()
- **Kiểm tra và lấy Enrollment:**
  - Gọi `enrollmentRepository.findById(request.getEnrollmentId())` để tìm Enrollment theo ID
  - Nếu không tìm thấy → throw ResourceNotFoundException("Enrollment not found with id: " + request.getEnrollmentId())
  
- **Kiểm tra điều kiện cấp chứng chỉ:**
  - Kiểm tra `enrollment.getProgress() < 100.0`
  - Nếu chưa đạt 100% → throw RuntimeException("Cannot issue certificate. Course not completed yet.")
  
- **Kiểm tra trùng lặp:**
  - Gọi `certificateRepository.findByEnrollmentId(enrollment.getId())` để kiểm tra chứng chỉ đã được cấp chưa
  - Nếu đã tồn tại → throw RuntimeException("Certificate already issued for this enrollment")
  
- **Tạo chứng chỉ mới:**
  - Tạo instance `Certificate certificate = new Certificate()`
  - Set quan hệ:
    - `certificate.setEnrollment(enrollment)` - Liên kết với enrollment
  - Set thông tin:
    - `certificate.setCertificateCode(generateCertificateCode())` - Tạo mã code duy nhất (VD: CERT-ABC12345)
    - `certificate.setIssuedAt(LocalDateTime.now())` - Thời gian cấp chứng chỉ
  
- **Lưu chứng chỉ vào Database:**
  - Gọi `certificateRepository.save(certificate)` để lưu
  
- **Tạo file PDF chứng chỉ:**
  - Gọi `pdfGeneratorService.generateCertificatePdfAndSave(saved)` để tạo file PDF
  - Lưu đường dẫn PDF: `saved.setPdfUrl(pdfUrl)`
  - Cập nhật lại chứng chỉ: `certificateRepository.save(saved)`
  - Nếu lỗi tạo PDF → chỉ log, không throw exception (vẫn cấp chứng chỉ)
  
- **Trả về kết quả:**
  - Controller nhận Certificate đã lưu
  - Convert sang `CertificateDTO` bằng `convertToDTO(saved)`
  - Trả về ResponseEntity với status 201 (CREATED)

### 4.3. Tải chứng chỉ theo mã code

#### 1. Điểm bắt đầu: CertificateController.java
- Client gửi request GET tới `/api/v1/certificates/code/{code}/download`
- Không yêu cầu quyền đặc biệt (public endpoint)

#### 2. Xử lý nghiệp vụ: CertificateService.downloadCertificateByCode()
- **Tìm chứng chỉ theo mã code:**
  - Gọi `certificateRepository.findByCertificateCode(code)` để tìm Certificate
  - Nếu không tìm thấy → throw ResourceNotFoundException("Certificate not found with code: " + code)
  
- **Xử lý tải file:**
  - Gọi `downloadCertificateFile(certificate)` để xử lý download

#### 3. Xử lý file PDF: CertificateService.downloadCertificateFile()
- **Kiểm tra file PDF đã tồn tại:**
  - Kiểm tra `certificate.getPdfUrl() == null || certificate.getPdfUrl().isEmpty()`
  - Nếu chưa có:
    - Lấy đầy đủ thông tin certificate kèm enrollment: `certificateRepository.findByIdWithEnrollment(certificate.getId())`
    - Kiểm tra dữ liệu enrollment có đầy đủ không
    - Nếu không đầy đủ → trả về lỗi 500
    - Tạo lại file PDF: `pdfGeneratorService.generateCertificatePdfAndSave(fullCertificate)`
    - Cập nhật PDF URL và lưu lại
  
- **Xử lý đường dẫn file:**
  - Lấy `pdfPath = certificate.getPdfUrl()`
  - Nếu là URL đầy đủ (http/https) → Trích xuất phần đường dẫn sau domain
  - Chuẩn hóa đường dẫn thành đường dẫn tương đối từ thư mục gốc project (VD: `./certificates/file.pdf`)
  
- **Kiểm tra file tồn tại:**
  - Chuyển đổi đường dẫn thành `Path` và `File` object
  - Kiểm tra `file.exists() && file.isFile()`
  - Nếu không tồn tại → trả về lỗi 404
  
- **Trả về file PDF:**
  - Tạo `Resource` từ file: `new FileSystemResource(file)`
  - Xác định content type (mặc định là `application/pdf`)
  - Trả về ResponseEntity với:
    - Content type: `application/pdf`
    - Header `Content-Disposition`: `attachment; filename="..."` (để browser tự động download)
    - Body: Resource (file PDF)
  - Status code 200 (OK)

### 4.4. Lấy danh sách chứng chỉ của user

#### 1. Điểm bắt đầu: CertificateController.java
- Client gửi request GET tới `/api/v1/certificates/user/{userId}`
- Không yêu cầu quyền đặc biệt (public endpoint)
- Có phân trang: `page` (mặc định 0), `size` (mặc định 10)

#### 2. Xử lý nghiệp vụ: CertificateService.getUserCertificates()
- **Lấy danh sách chứng chỉ:**
  - Gọi `certificateRepository.findByEnrollmentUserId(userId, pageable)` để lấy danh sách chứng chỉ của user (có phân trang, sắp xếp theo `issuedAt` DESC)
  
- **Trả về kết quả:**
  - Convert từng Certificate sang `CertificateDTO` bằng `convertToDTO()`
  - Trả về `Page<CertificateDTO>` với status 200 (OK)

---

## KỊCH BẢN 5: ĐÁNH GIÁ, NHẬN XÉT

### 5.1. Tạo hoặc cập nhật đánh giá

#### 1. Điểm bắt đầu: ReviewController.java
- Client gửi request POST tới `/api/reviews/courses/{courseId}`
- Yêu cầu phải có quyền STUDENT, LECTURER hoặc ADMIN (được kiểm tra bởi `@PreAuthorize("hasRole('STUDENT') or hasRole('LECTURER') or hasRole('ADMIN')")`)
- Request body là đối tượng `ReviewRequest` (đã được validate bởi `@Valid`)
  - `rating`: Điểm đánh giá (1-5)
  - `comment`: Nội dung nhận xét

#### 2. Xử lý nghiệp vụ: ReviewService.createOrUpdateReview()
- **Kiểm tra và lấy User:**
  - Gọi `userRepository.findById(userId)` để tìm User theo ID
  - Nếu không tìm thấy → throw RuntimeException("Không tìm thấy người dùng")
  
- **Kiểm tra và lấy Course:**
  - Gọi `courseRepository.findById(courseId)` để tìm Course theo ID
  - Nếu không tìm thấy → throw RuntimeException("Không tìm thấy khóa học")
  
- **Kiểm tra điều kiện đánh giá:**
  - Gọi `enrollmentRepository.existsByUserIdAndCourseId(userId, courseId)` để kiểm tra đã đăng ký khóa học chưa
  - Nếu chưa đăng ký → throw RuntimeException("Bạn cần đăng ký khóa học trước khi đánh giá")
  
- **Kiểm tra đánh giá đã tồn tại:**
  - Gọi `reviewRepository.findByUserIdAndCourseId(userId, courseId)` để tìm Review đã có
  - Nếu đã tồn tại → cập nhật Review hiện có
  - Nếu chưa tồn tại → tạo Review mới
  - Lưu flag `isNewReview` để xác định là review mới hay cập nhật
  
- **Tạo hoặc cập nhật Review:**
  - Nếu chưa có → tạo mới `Review review = new Review()`
  - Nếu đã có → lấy Review hiện có
  - Set thông tin:
    - `review.setUser(user)`
    - `review.setCourse(course)`
    - `review.setRating(request.getRating())` - Điểm đánh giá (1-5)
    - `review.setComment(request.getComment())` - Nội dung nhận xét
  
- **Lưu Review:**
  - Gọi `reviewRepository.save(review)` để lưu
  
- **Gửi thông báo:**
  - Nếu là review mới:
    - Gọi `notificationService.notifyNewReview(userId, courseId, request.getRating())` để gửi thông báo đánh giá mới
  - Nếu là cập nhật:
    - Gọi `notificationService.notifyReviewUpdate(userId, courseId, request.getRating())` để gửi thông báo cập nhật đánh giá
  - Nếu lỗi thông báo → chỉ log, không throw exception
  
- **Trả về kết quả:**
  - Controller nhận Review đã lưu
  - Convert sang `ReviewDTO` bằng `convertToDTO(savedReview)`
  - Trả về ResponseEntity với status 200 (OK)

### 5.2. Lấy đánh giá của user cho một khóa học

#### 1. Điểm bắt đầu: ReviewController.java
- Client gửi request GET tới `/api/reviews/courses/{courseId}/my-review`
- Yêu cầu phải có quyền STUDENT, LECTURER hoặc ADMIN

#### 2. Xử lý nghiệp vụ: ReviewService.getUserReviewForCourse()
- **Tìm Review:**
  - Gọi `reviewRepository.findByUserIdAndCourseId(userId, courseId)` để tìm Review
  - Nếu tìm thấy → convert sang `ReviewDTO` bằng `convertToDTO()`
  - Nếu không tìm thấy → trả về `Optional.empty()`
  
- **Trả về kết quả:**
  - Controller kiểm tra Optional:
    - Nếu có → trả về ReviewDTO với status 200 (OK)
    - Nếu không có → trả về ResponseEntity với status 200 (OK) nhưng body rỗng

### 5.3. Lấy tất cả đánh giá của một khóa học

#### 1. Điểm bắt đầu: ReviewController.java
- Client gửi request GET tới `/api/reviews/courses/{courseId}`
- Không yêu cầu quyền đặc biệt (public endpoint)
- Có phân trang: `page` (mặc định 0), `size` (mặc định 10)
- Có sắp xếp: `sortBy` (mặc định "createdAt"), `sortDir` (mặc định "desc")

#### 2. Xử lý nghiệp vụ: ReviewService.getCourseReviews()
- **Lấy danh sách đánh giá:**
  - Tạo `Pageable` với phân trang và sắp xếp
  - Gọi `reviewRepository.findByCourseId(courseId, pageable)` để lấy danh sách Review (có phân trang)
  
- **Trả về kết quả:**
  - Convert từng Review sang `ReviewDTO` bằng `convertToDTO()`
  - Trả về `Page<ReviewDTO>` với status 200 (OK)

### 5.4. Lấy thông tin rating tổng hợp của khóa học

#### 1. Điểm bắt đầu: ReviewController.java
- Client gửi request GET tới `/api/reviews/courses/{courseId}/rating`
- Không yêu cầu quyền đặc biệt (public endpoint)

#### 2. Xử lý nghiệp vụ: ReviewService.getCourseRating()
- **Lấy điểm đánh giá trung bình:**
  - Gọi `reviewRepository.getAverageRatingByCourseId(courseId)` để lấy điểm trung bình
  - Nếu null → set = 0.0
  
- **Đếm tổng số đánh giá:**
  - Gọi `reviewRepository.countByCourseId(courseId)` để đếm tổng số Review
  - Nếu null → set = 0L
  
- **Lấy phân phối điểm đánh giá:**
  - Khởi tạo Map với các key 1-5, value = 0L
  - Gọi `reviewRepository.getRatingDistribution(courseId)` để lấy phân phối điểm
  - Cập nhật Map với số lượng đánh giá theo từng điểm (1 sao, 2 sao, ..., 5 sao)
  
- **Trả về kết quả:**
  - Tạo `CourseRatingDTO` với:
    - `courseId`: ID khóa học
    - `averageRating`: Điểm trung bình
    - `totalReviews`: Tổng số đánh giá
    - `distribution`: Map phân phối điểm (1-5 sao)
  - Trả về ResponseEntity với status 200 (OK)

### 5.5. Giảng viên phản hồi đánh giá

#### 1. Điểm bắt đầu: ReviewController.java
- Client gửi request POST tới `/api/reviews/{reviewId}/reply`
- Yêu cầu phải có quyền LECTURER hoặc ADMIN
- Request body chứa `reply`: Nội dung phản hồi

#### 2. Xử lý nghiệp vụ: ReviewService.replyToReview()
- **Kiểm tra và lấy Review:**
  - Gọi `reviewRepository.findById(reviewId)` để tìm Review theo ID
  - Nếu không tìm thấy → throw RuntimeException("Không tìm thấy đánh giá")
  
- **Kiểm tra quyền:**
  - Kiểm tra `review.getCourse().getInstructor()` có tồn tại không
  - Kiểm tra `review.getCourse().getInstructor().getId().equals(instructorId)`
  - Nếu không khớp → throw RuntimeException("Bạn không có quyền phản hồi đánh giá này")
  
- **Cập nhật phản hồi:**
  - `review.setInstructorReply(reply)` - Nội dung phản hồi
  - `review.setRepliedAt(LocalDateTime.now())` - Thời gian phản hồi
  
- **Lưu Review:**
  - Gọi `reviewRepository.save(review)` để lưu
  
- **Gửi thông báo:**
  - Gọi `notificationService.notifyReviewReply()` để gửi thông báo cho học viên về phản hồi của giảng viên
  
- **Trả về kết quả:**
  - Controller nhận Review đã cập nhật
  - Convert sang `ReviewDTO` bằng `convertToDTO(savedReview)`
  - Trả về ResponseEntity với status 200 (OK)

### 5.6. Xóa đánh giá

#### 1. Điểm bắt đầu: ReviewController.java
- Client gửi request DELETE tới `/api/reviews/{reviewId}`
- Yêu cầu phải có quyền STUDENT, LECTURER hoặc ADMIN

#### 2. Xử lý nghiệp vụ: ReviewService.deleteReview()
- **Kiểm tra và lấy Review:**
  - Gọi `reviewRepository.findById(reviewId)` để tìm Review theo ID
  - Nếu không tìm thấy → throw RuntimeException("Không tìm thấy đánh giá")
  
- **Kiểm tra quyền:**
  - Kiểm tra `review.getUser().getId().equals(userId)`
  - Nếu không khớp → throw RuntimeException("Bạn không có quyền xóa đánh giá này")
  
- **Xóa Review:**
  - Gọi `reviewRepository.delete(review)` để xóa
  
- **Trả về kết quả:**
  - Controller trả về ResponseEntity với message "Đã xóa đánh giá thành công"
  - Status code 200 (OK)

---

## TÓM TẮT LUỒNG DỮ LIỆU

```
GHI DANH:
Client → EnrollmentController.createEnrollment() → EnrollmentService.createEnrollment() → 
  → UserRepository.findById() → CourseRepository.findById() → 
  → EnrollmentRepository.findByUserIdAndCourseId() (kiểm tra trùng) → 
  → EnrollmentRepository.save() → Database

HỌC BÀI:
Client → ContentAccessController.getCourseContent() → ContentService.getCourseContent() → 
  → UserRepository.findById() → CourseRepository.findById() → 
  → EnrollmentRepository.findByUserAndCourse() (kiểm tra đăng ký) → 
  → ChapterRepository.findByCourseIdOrderByPositionAsc() → 
  → UserProgressRepository.findByEnrollmentWithLesson() → 
  → Trả về danh sách ChapterResponse với LessonResponse

CẬP NHẬT TIẾN ĐỘ (Manual):
Client → ContentAccessController.markLessonAsCompleted() → ContentService.markLessonAsCompleted() → 
  → UserRepository.findById() → LessonRepository.findById() → 
  → EnrollmentRepository.findByUserAndCourse() → 
  → UserProgressRepository.findByEnrollmentAndLesson() → 
  → UserProgressRepository.save() → ContentService.updateEnrollmentProgress() → 
  → UserProgressRepository.countByEnrollmentAndIsCompleted() → 
  → EnrollmentRepository.save() → CertificateService.autoIssueCertificate() (nếu >= 100%)

CẬP NHẬT TIẾN ĐỘ (Auto-Progress):
Client → ContentAccessController.updateLessonProgress() → ContentService.updateLessonWatchTime() → 
  → UserRepository.findById() → LessonRepository.findById() → 
  → EnrollmentRepository.findByUserAndCourse() → 
  → UserProgressRepository.findByEnrollmentAndLesson() → 
  → Tính percent = watchedTime / totalDuration → 
  → Nếu percent >= 0.9: UserProgressRepository.save() + updateEnrollmentProgress() → 
  → Nếu không: UserProgressRepository.save()

NHẬN CHỨNG CHỈ (Tự động):
ContentService.updateEnrollmentProgress() → CertificateService.autoIssueCertificate() → 
  → CertificateService.existsByEnrollmentId() (kiểm tra trùng) → 
  → CertificateService.issueCertificate() → 
  → EnrollmentRepository.findById() → Kiểm tra progress >= 100% → 
  → CertificateRepository.findByEnrollmentId() (kiểm tra trùng) → 
  → CertificateRepository.save() → PdfGeneratorService.generateCertificatePdfAndSave() → 
  → CertificateRepository.save() (cập nhật PDF URL)

TẢI CHỨNG CHỈ:
Client → CertificateController.downloadCertificateByCode() → CertificateService.downloadCertificateByCode() → 
  → CertificateRepository.findByCertificateCode() → 
  → CertificateService.downloadCertificateFile() → 
  → Kiểm tra PDF URL → Tạo lại PDF nếu chưa có → 
  → Xử lý đường dẫn file → Kiểm tra file tồn tại → 
  → Trả về FileSystemResource

ĐÁNH GIÁ, NHẬN XÉT:
Client → ReviewController.createOrUpdateReview() → ReviewService.createOrUpdateReview() → 
  → UserRepository.findById() → CourseRepository.findById() → 
  → EnrollmentRepository.existsByUserIdAndCourseId() (kiểm tra đăng ký) → 
  → ReviewRepository.findByUserIdAndCourseId() (kiểm tra đã đánh giá) → 
  → ReviewRepository.save() → NotificationService.notifyNewReview() / notifyReviewUpdate()

LẤY RATING TỔNG HỢP:
Client → ReviewController.getCourseRating() → ReviewService.getCourseRating() → 
  → ReviewRepository.getAverageRatingByCourseId() → 
  → ReviewRepository.countByCourseId() → 
  → ReviewRepository.getRatingDistribution() → 
  → Trả về CourseRatingDTO
```

---

## CÁC ĐIỂM LƯU Ý QUAN TRỌNG

1. **Bảo mật:**
   - Tất cả các endpoint đều có kiểm tra quyền truy cập
   - Học viên chỉ có thể xem và học các khóa học đã đăng ký
   - Chỉ học viên đã đăng ký mới có thể đánh giá khóa học
   - Giảng viên chỉ có thể phản hồi đánh giá của khóa học của mình

2. **Validation:**
   - Tất cả DTO đều có validation annotations (@NotBlank, @NotNull, @Min, @Max, etc.)
   - Controller sử dụng @Valid để tự động validate request body

3. **Transaction:**
   - Các service method đều có annotation @Transactional để đảm bảo tính toàn vẹn dữ liệu

4. **Kiểm tra điều kiện:**
   - Ghi danh: Kiểm tra trùng lặp (một học viên không thể đăng ký 2 lần cùng một khóa học)
   - Học bài: Kiểm tra đã đăng ký khóa học chưa
   - Cấp chứng chỉ: Kiểm tra progress >= 100% và chưa được cấp chứng chỉ
   - Đánh giá: Kiểm tra đã đăng ký khóa học chưa

5. **Tự động hóa:**
   - Tự động đánh dấu hoàn thành bài học khi xem >= 90% (Auto-Progress)
   - Tự động cập nhật tiến độ enrollment khi hoàn thành bài học
   - Tự động cấp chứng chỉ khi hoàn thành khóa học (progress >= 100%)
   - Tự động tạo lại PDF chứng chỉ nếu chưa có khi download

6. **Khóa bài học:**
   - Bài học bị khóa nếu bài học trước đó chưa hoàn thành
   - Bài học đầu tiên của chương mới bị khóa nếu bài học cuối của chương trước chưa hoàn thành
   - Bài học đầu tiên của chương đầu tiên luôn mở khóa

7. **Thông báo:**
   - Gửi thông báo khi có đánh giá mới hoặc cập nhật đánh giá
   - Gửi thông báo khi giảng viên phản hồi đánh giá
   - Lỗi thông báo không ảnh hưởng đến việc tạo/cập nhật đánh giá

8. **Tính toán tiến độ:**
   - Tiến độ enrollment = (Số bài học đã hoàn thành / Tổng số bài học) * 100%
   - Làm tròn đến 2 chữ số thập phân
   - Khi tiến độ >= 100%, tự động đổi trạng thái sang COMPLETED

