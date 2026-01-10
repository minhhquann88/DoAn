# LUỒNG HOẠT ĐỘNG MODULE QUẢN LÝ KHÓA HỌC & NỘI DUNG

## KỊCH BẢN 1: THÊM DANH MỤC

### 1. Điểm bắt đầu: AdminCategoryController.java
- Client gửi request POST tới `/api/v1/admin/categories`
- Yêu cầu phải có quyền ADMIN (được kiểm tra bởi `@PreAuthorize("hasRole('ADMIN')")`)

### 2. Xử lý nghiệp vụ: AdminCategoryController.createCategory()
- **Kiểm tra dữ liệu đầu vào:**
  - Lấy `name` và `description` từ request body (Map<String, String>)
  - Kiểm tra `name` không được null hoặc rỗng
  - Nếu thiếu → trả về lỗi 400 với message "Tên danh mục không được để trống"
  
- **Kiểm tra trùng lặp:**
  - Gọi `categoryRepository.existsByName(name.trim())` để kiểm tra tên danh mục đã tồn tại chưa
  - Nếu đã tồn tại → trả về lỗi 409 (CONFLICT) với message "Tên danh mục đã tồn tại"
  
- **Tạo đối tượng Category mới:**
  - Tạo instance `Category category = new Category()`
  - Set `category.setName(name.trim())` (loại bỏ khoảng trắng thừa)
  - Set `category.setDescription(description.trim())` nếu description không null
  
- **Lưu xuống Database:**
  - Gọi `categoryRepository.save(category)` để lưu Category vào database
  - Trả về Category đã lưu với status code 201 (CREATED)

---

## KỊCH BẢN 2: THÊM KHÓA HỌC

### 1. Điểm bắt đầu: CourseController.java
- Client gửi request POST tới `/api/v1/courses`
- Yêu cầu phải có quyền ADMIN hoặc LECTURER (được kiểm tra bởi `@PreAuthorize("hasRole('ADMIN') or hasRole('LECTURER')")`)
- Request body là đối tượng `CourseRequest` (đã được validate bởi `@Valid`)

### 2. Xử lý nghiệp vụ: CourseService.createCourse()
- **Lấy thông tin người dùng hiện tại:**
  - Gọi `getCurrentUser(userDetails)` để lấy đối tượng `User` từ database
  - User này sẽ là `instructor` của khóa học
  
- **Kiểm tra và lấy Category:**
  - Gọi `categoryRepository.findById(request.getCategoryId())` để tìm Category theo ID
  - Nếu không tìm thấy → throw RuntimeException("Category not found!")
  
- **Tạo đối tượng Course mới:**
  - Tạo instance `Course course = new Course()`
  - Set các thuộc tính từ `CourseRequest`:
    - `course.setTitle(request.getTitle())`
    - `course.setDescription(request.getDescription())`
    - `course.setPrice(request.getPrice())`
    - `course.setImageUrl(request.getImageUrl())`
    - `course.setTotalDurationInHours(request.getTotalDurationInHours())`
  - Set quan hệ:
    - `course.setCategory(category)` - Gán danh mục cho khóa học
    - `course.setInstructor(instructor)` - Gán giảng viên cho khóa học
  - Set thời gian:
    - `course.setCreatedAt(LocalDateTime.now())`
    - `course.setUpdatedAt(LocalDateTime.now())`
  
- **Xử lý trạng thái khóa học:**
  - Kiểm tra quyền của user:
    - Nếu là ADMIN → `course.setStatus(ECourseStatus.PUBLISHED)`
    - Nếu là LECTURER → `course.setStatus(ECourseStatus.DRAFT)`
  
- **Lưu xuống Database:**
  - Gọi `courseRepository.save(course)` để lưu Course vào database
  
- **Gửi thông báo email (nếu khóa học được publish ngay):**
  - Nếu `savedCourse.getStatus() == ECourseStatus.PUBLISHED`
  - Gọi `newsletterService.sendNewCourseNotification()` để gửi email thông báo khóa học mới
  - Nếu lỗi email, không throw exception để không ảnh hưởng đến việc tạo khóa học
  
- **Trả về kết quả:**
  - Controller nhận Course đã lưu
  - Convert sang `CourseResponse` bằng `CourseResponse.fromEntity(course)`
  - Trả về ResponseEntity với status 200 (OK)

---

## KỊCH BẢN 3: THÊM CHƯƠNG

### 1. Điểm bắt đầu: ChapterController.java
- Client gửi request POST tới `/api/v1/courses/{courseId}/chapters`
- Yêu cầu phải có quyền ADMIN hoặc là giảng viên của khóa học (được kiểm tra bởi `@PreAuthorize("hasRole('ADMIN') or @courseSecurityService.isInstructor(authentication, #courseId)")`)
- Request body là đối tượng `ChapterRequest` (đã được validate bởi `@Valid`)

### 2. Xử lý nghiệp vụ: ContentService.createChapter()
- **Kiểm tra và lấy Course:**
  - Gọi `courseRepository.findById(courseId)` để tìm Course theo ID
  - Nếu không tìm thấy → throw RuntimeException("Course not found!")
  
- **Tạo đối tượng Chapter mới:**
  - Tạo instance `Chapter chapter = new Chapter()`
  - Set các thuộc tính từ `ChapterRequest`:
    - `chapter.setTitle(request.getTitle())` - Tiêu đề chương
    - `chapter.setPosition(request.getPosition())` - Thứ tự chương trong khóa học
  - Set quan hệ:
    - `chapter.setCourse(course)` - Gán chương vào khóa học
  
- **Lưu xuống Database:**
  - Gọi `chapterRepository.save(chapter)` để lưu Chapter vào database
  - Cascade: Khi lưu Chapter, quan hệ với Course được tự động cập nhật
  
- **Trả về kết quả:**
  - Controller nhận Chapter đã lưu
  - Convert sang `ChapterResponse` bằng `ChapterResponse.fromEntity(chapter, List.of())`
  - Trả về ResponseEntity với message "Chapter created successfully" và chapter data
  - Status code 200 (OK)

---

## KỊCH BẢN 4: THÊM BÀI HỌC

### 1. Điểm bắt đầu: ChapterController.java
- Client gửi request POST tới `/api/v1/courses/{courseId}/chapters/{chapterId}/lessons`
- Yêu cầu phải có quyền ADMIN hoặc là giảng viên của chương (được kiểm tra bởi `@PreAuthorize("hasRole('ADMIN') or @courseSecurityService.isInstructorOfChapter(authentication, #chapterId)")`)
- Request body là đối tượng `LessonRequest` (đã được validate bởi `@Valid`)

### 2. Xử lý nghiệp vụ: ContentService.createLesson()
- **Kiểm tra và lấy Chapter:**
  - Gọi `chapterRepository.findById(chapterId)` để tìm Chapter theo ID
  - Nếu không tìm thấy → throw RuntimeException("Chapter not found!")
  
- **Tạo đối tượng Lesson mới:**
  - Tạo instance `Lesson lesson = new Lesson()`
  - Set các thuộc tính từ `LessonRequest`:
    - `lesson.setTitle(request.getTitle())` - Tiêu đề bài học
    - `lesson.setContentType(request.getContentType())` - Loại nội dung (VIDEO, TEXT, DOCUMENT, SLIDE, YOUTUBE)
    - `lesson.setVideoUrl(request.getVideoUrl())` - URL video (nếu có)
    - `lesson.setDocumentUrl(request.getDocumentUrl())` - URL tài liệu (nếu có)
    - `lesson.setSlideUrl(request.getSlideUrl())` - URL slide (nếu có)
    - `lesson.setContent(request.getContent())` - Nội dung text (nếu có)
    - `lesson.setPosition(request.getPosition())` - Thứ tự bài học trong chương
    - `lesson.setIsPreview(request.getIsPreview())` - Có phải bài học preview không (mặc định false)
  - Set quan hệ:
    - `lesson.setChapter(chapter)` - Gán bài học vào chương
  
- **Xử lý thời lượng (duration):**
  - Nếu `contentType == EContentType.YOUTUBE`:
    - Set `lesson.setDurationInMinutes(0)` - YouTube không cần duration
  - Nếu không phải YOUTUBE:
    - Gọi `calculateDuration(request)` để tự động tính duration từ video URL
    - Nếu không tính được, sử dụng `request.getDurationInMinutes()` nếu có
    - Nếu không có, set = 0
  
- **Lưu xuống Database:**
  - Gọi `lessonRepository.save(lesson)` để lưu Lesson vào database
  - Cascade: Khi lưu Lesson, quan hệ với Chapter được tự động cập nhật
  
- **Trả về kết quả:**
  - Controller nhận Lesson đã lưu
  - Convert sang `LessonResponse` bằng `LessonResponse.fromEntity(lesson, false)`
  - Trả về ResponseEntity với message "Lesson created successfully" và lesson data
  - Status code 200 (OK)

---

## KỊCH BẢN 5: XUẤT BẢN KHÓA HỌC

### 1. Điểm bắt đầu: CourseController.java
- Client gửi request POST tới `/api/v1/courses/{id}/publish`
- Yêu cầu phải có quyền LECTURER hoặc ADMIN (được kiểm tra bởi `@PreAuthorize("hasRole('LECTURER') or hasRole('ADMIN')")`)

### 2. Xử lý nghiệp vụ: CourseService.publishCourse()
- **Kiểm tra và lấy Course:**
  - Gọi `courseRepository.findById(courseId)` để tìm Course theo ID
  - Nếu không tìm thấy → throw RuntimeException("Course not found!")
  
- **Kiểm tra quyền:**
  - Kiểm tra user có phải ADMIN không
  - Nếu không phải ADMIN:
    - Kiểm tra `course.getInstructor()` có tồn tại không
    - Kiểm tra `course.getInstructor().getId()` có khớp với `userDetails.getId()` không
    - Nếu không khớp → throw RuntimeException("You are not authorized to publish this course.")
  
- **Kiểm tra trạng thái khóa học:**
  - Kiểm tra `course.getStatus() == ECourseStatus.DRAFT`
  - Nếu không phải DRAFT → throw RuntimeException("Only DRAFT courses can be published. Current status: " + course.getStatus())
  
- **Kiểm tra nội dung khóa học:**
  - **Kiểm tra có ít nhất 1 chương:**
    - Gọi `chapterRepository.findByCourseIdOrderByPositionAsc(courseId)` để lấy danh sách chương
    - Nếu danh sách rỗng hoặc null → throw RuntimeException("Khóa học phải có ít nhất 1 chương trước khi xuất bản. Vui lòng thêm nội dung cho khóa học.")
  
  - **Kiểm tra mỗi chương có ít nhất 1 bài học:**
    - Duyệt qua từng chương trong danh sách
    - Với mỗi chương, gọi `lessonRepository.findByChapterIdOrderByPositionAsc(chapter.getId())` để lấy danh sách bài học
    - Nếu chương nào không có bài học → throw RuntimeException("Chương \"" + chapter.getTitle() + "\" phải có ít nhất 1 bài học. Vui lòng thêm bài học cho chương này.")
  
- **Cập nhật trạng thái khóa học:**
  - `course.setStatus(ECourseStatus.PUBLISHED)` - Đổi trạng thái sang PUBLISHED
  - `course.setIsPublished(true)` - Đánh dấu đã publish
  - `course.setUpdatedAt(LocalDateTime.now())` - Cập nhật thời gian
  
- **Lưu xuống Database:**
  - Gọi `courseRepository.save(course)` để lưu thay đổi vào database
  
- **Gửi thông báo email:**
  - Tạo URL khóa học: `"http://localhost:3000/courses/" + savedCourse.getId()`
  - Gọi `newsletterService.sendNewCourseNotification(savedCourse.getTitle(), courseUrl)` để gửi email thông báo
  - Nếu lỗi email, không throw exception để không ảnh hưởng đến việc publish khóa học
  
- **Trả về kết quả:**
  - Controller nhận Course đã publish
  - Convert sang `CourseResponse` bằng `CourseResponse.fromEntity(publishedCourse)`
  - Trả về ResponseEntity với status 200 (OK)

---

## TÓM TẮT LUỒNG DỮ LIỆU

```
THÊM DANH MỤC:
Client → AdminCategoryController.createCategory() → CategoryRepository.save() → Database

THÊM KHÓA HỌC:
Client → CourseController.createCourse() → CourseService.createCourse() → 
  → CategoryRepository.findById() → CourseRepository.save() → Database

THÊM CHƯƠNG:
Client → ChapterController.createChapter() → ContentService.createChapter() → 
  → CourseRepository.findById() → ChapterRepository.save() → Database

THÊM BÀI HỌC:
Client → ChapterController.createLesson() → ContentService.createLesson() → 
  → ChapterRepository.findById() → VideoDurationService.calculateDuration() → 
  → LessonRepository.save() → Database

XUẤT BẢN KHÓA HỌC:
Client → CourseController.publishCourse() → CourseService.publishCourse() → 
  → CourseRepository.findById() → Kiểm tra quyền → 
  → ChapterRepository.findByCourseIdOrderByPositionAsc() → 
  → LessonRepository.findByChapterIdOrderByPositionAsc() (cho mỗi chương) → 
  → CourseRepository.save() → NewsletterService.sendNewCourseNotification() → Database
```

---

## CÁC ĐIỂM LƯU Ý QUAN TRỌNG

1. **Bảo mật:**
   - Tất cả các endpoint đều có kiểm tra quyền truy cập
   - Admin có thể thực hiện tất cả các thao tác
   - LECTURER chỉ có thể quản lý khóa học của chính mình

2. **Validation:**
   - Tất cả DTO đều có validation annotations (@NotBlank, @NotNull, etc.)
   - Controller sử dụng @Valid để tự động validate request body

3. **Transaction:**
   - Các service method đều có annotation @Transactional để đảm bảo tính toàn vẹn dữ liệu

4. **Kiểm tra nội dung khi publish:**
   - Khóa học phải có ít nhất 1 chương
   - Mỗi chương phải có ít nhất 1 bài học
   - Chỉ khóa học ở trạng thái DRAFT mới có thể publish

5. **Tự động tính duration:**
   - Hệ thống tự động tính duration cho video (trừ YouTube)
   - YouTube sử dụng API riêng để lấy duration

6. **Thông báo email:**
   - Khi khóa học được publish, hệ thống tự động gửi email thông báo
   - Lỗi email không ảnh hưởng đến việc publish khóa học

