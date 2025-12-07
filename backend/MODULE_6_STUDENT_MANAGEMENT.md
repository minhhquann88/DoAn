# MODULE 6: QUẢN LÝ HỌC VIÊN (STUDENT MANAGEMENT)

## 📋 Tổng quan

Module quản lý học viên và enrollment (đăng ký khóa học) trong hệ thống Elearning.

### Tính năng chính:

✅ **Quản lý Enrollment:**
- Xem danh sách học viên đăng ký theo khóa học
- Xem danh sách khóa học của học viên
- Cấp phát trạng thái: ACTIVE, COMPLETED, DROPPED, SUSPENDED
- Xóa học viên khỏi khóa học (Admin)

✅ **Lịch sử học tập:**
- Xem lịch sử học tập đầy đủ
- Tiến độ học (progress 0-100%)
- Điểm số hiện tại
- Ngày đăng ký, ngày hoàn thành
- Lần truy cập cuối

✅ **Thống kê học viên:**
- Số lượng học viên mới theo tháng
- Tổng số khóa học đã đăng ký
- Số khóa học hoàn thành / đang học / đã bỏ
- Tiến độ trung bình
- Số chứng chỉ đã nhận

---

## 📁 Cấu trúc Files

```
DoAn-main/src/main/java/com/coursemgmt/
├── dto/
│   ├── EnrollmentDTO.java
│   ├── EnrollmentCreateRequest.java
│   ├── EnrollmentUpdateRequest.java
│   ├── StudentLearningHistoryDTO.java
│   └── MonthlyStudentStatsDTO.java
├── service/
│   └── EnrollmentService.java
└── controller/
    └── EnrollmentController.java
```

---

## 🔌 API Endpoints (8 endpoints)

### 1. Danh sách enrollment theo course

```http
GET /api/v1/enrollments/course/{courseId}?page=0&size=20
```

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "studentId": 5,
      "studentName": "Nguyen Van A",
      "studentEmail": "student@example.com",
      "courseId": 1,
      "courseTitle": "Lập trình Python",
      "instructorName": "Mr. Teacher",
      "status": "ACTIVE",
      "progress": 65.5,
      "currentScore": 82.0,
      "enrolledAt": "2025-01-15T10:30:00",
      "completedAt": null,
      "lastAccessedAt": "2025-11-13T14:20:00",
      "completedLessons": 13,
      "totalLessons": 20,
      "testsTaken": 3,
      "averageTestScore": 85.5,
      "isPaid": true,
      "paidAmount": 299000
    }
  ],
  "pageable": {...},
  "totalElements": 150,
  "totalPages": 8
}
```

### 2. Danh sách enrollment theo student

```http
GET /api/v1/enrollments/student/{studentId}?page=0&size=20
```

**Response:** Same structure as above

### 3. Chi tiết enrollment

```http
GET /api/v1/enrollments/{id}
```

**Response:** Single EnrollmentDTO object

### 4. Tạo enrollment mới

```http
POST /api/v1/enrollments
Content-Type: application/json

{
  "studentId": 5,
  "courseId": 10,
  "isPaid": true,
  "paidAmount": 299000
}
```

**Response:**
```json
{
  "id": 125,
  "studentId": 5,
  "studentName": "Nguyen Van A",
  "courseId": 10,
  "courseTitle": "Web Development",
  "status": "ACTIVE",
  "progress": 0.0,
  "enrolledAt": "2025-11-13T15:00:00"
}
```

### 5. Cập nhật enrollment

```http
PATCH /api/v1/enrollments/{id}
Content-Type: application/json

{
  "status": "COMPLETED",
  "progress": 100.0,
  "currentScore": 92.5
}
```

**Response:** Updated EnrollmentDTO

### 6. Xóa enrollment (Admin only)

```http
DELETE /api/v1/enrollments/{id}
```

**Response:** 204 No Content

### 7. Lịch sử học tập

```http
GET /api/v1/enrollments/student/{studentId}/history
```

**Response:**
```json
{
  "studentId": 5,
  "studentName": "Nguyen Van A",
  "email": "student@example.com",
  "totalCoursesEnrolled": 15,
  "coursesCompleted": 8,
  "coursesInProgress": 6,
  "coursesDropped": 1,
  "overallProgress": 68.5,
  "overallAverageScore": 85.2,
  "enrollments": [
    {
      "id": 1,
      "courseTitle": "Python Basics",
      "status": "COMPLETED",
      "progress": 100.0,
      "enrolledAt": "2025-01-15T10:00:00",
      "completedAt": "2025-03-20T18:30:00"
    }
  ],
  "lastActivityDate": "2025-11-13T14:20:00",
  "totalLearningHours": 120,
  "totalTestsTaken": 45,
  "certificatesEarned": 8
}
```

### 8. Thống kê theo tháng

```http
GET /api/v1/enrollments/stats/monthly?year=2025
```

**Response:**
```json
{
  "monthlyData": [
    {
      "year": 2025,
      "month": 1,
      "monthName": "Jan 2025",
      "newStudents": 150,
      "enrollments": 320,
      "completions": 85
    },
    {
      "year": 2025,
      "month": 2,
      "monthName": "Feb 2025",
      "newStudents": 180,
      "enrollments": 380,
      "completions": 95
    }
  ]
}
```

---

## 📊 Use Cases

### Use Case 1: Instructor xem học viên của khóa học

```javascript
// Instructor muốn xem danh sách học viên trong khóa học của mình
const courseId = 10;
const response = await fetch(
  `http://localhost:8080/api/v1/enrollments/course/${courseId}?page=0&size=20`
);
const data = await response.json();

console.log(`Total students: ${data.totalElements}`);
data.content.forEach(enrollment => {
  console.log(`${enrollment.studentName} - Progress: ${enrollment.progress}%`);
});
```

### Use Case 2: Student xem khóa học đã đăng ký

```javascript
// Student xem danh sách khóa học của mình
const studentId = 5;
const response = await fetch(
  `http://localhost:8080/api/v1/enrollments/student/${studentId}`
);
const data = await response.json();

console.log(`You have ${data.totalElements} courses`);
data.content.forEach(enrollment => {
  console.log(`${enrollment.courseTitle} - ${enrollment.progress}% complete`);
});
```

### Use Case 3: Admin cập nhật trạng thái học viên

```javascript
// Admin đánh dấu học viên đã hoàn thành khóa học
const enrollmentId = 125;
const response = await fetch(
  `http://localhost:8080/api/v1/enrollments/${enrollmentId}`,
  {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'COMPLETED',
      progress: 100.0,
      currentScore: 92.5
    })
  }
);

const updated = await response.json();
console.log(`Status: ${updated.status}`);
```

### Use Case 4: Admin xóa học viên khỏi khóa học

```javascript
// Admin remove học viên vì vi phạm quy định
const enrollmentId = 125;
await fetch(`http://localhost:8080/api/v1/enrollments/${enrollmentId}`, {
  method: 'DELETE'
});

console.log('Student removed from course');
```

### Use Case 5: Xem lịch sử học tập đầy đủ

```javascript
// Admin/Teacher xem lịch sử học tập của học viên
const studentId = 5;
const response = await fetch(
  `http://localhost:8080/api/v1/enrollments/student/${studentId}/history`
);
const history = await response.json();

console.log(`Total courses: ${history.totalCoursesEnrolled}`);
console.log(`Completed: ${history.coursesCompleted}`);
console.log(`Average progress: ${history.overallProgress}%`);
console.log(`Certificates: ${history.certificatesEarned}`);
```

### Use Case 6: Admin xem thống kê theo tháng

```javascript
// Admin xem số học viên mới mỗi tháng
const response = await fetch(
  'http://localhost:8080/api/v1/enrollments/stats/monthly?year=2025'
);
const stats = await response.json();

stats.monthlyData.forEach(month => {
  console.log(`${month.monthName}: ${month.newStudents} new students`);
});
```

---

## 🔧 Business Logic

### Enrollment Status Flow

```
ACTIVE → COMPLETED (when progress = 100%)
ACTIVE → DROPPED (student quits)
ACTIVE → SUSPENDED (admin action)
SUSPENDED → ACTIVE (admin reactivates)
```

### Auto-completion Logic

```java
// Trong EnrollmentService
if (request.getProgress() >= 100.0) {
    enrollment.setStatus("COMPLETED");
    enrollment.setCompletedAt(LocalDateTime.now());
    
    // Trigger certificate generation
    certificateService.generateCertificate(enrollment);
}
```

### Validation Rules

1. **Create Enrollment:**
   - Student và Course phải tồn tại
   - Student chưa đăng ký course này trước đó
   - Course phải ở trạng thái PUBLISHED

2. **Update Enrollment:**
   - Chỉ có thể update nếu status = ACTIVE
   - Progress phải từ 0-100
   - Score phải từ 0-100

3. **Delete Enrollment:**
   - Chỉ Admin mới được xóa
   - Có thể cần refund nếu đã thanh toán
   - Xóa soft (update status = DELETED) thay vì hard delete

---

## 📈 Integration với modules khác

### Module 8 (Statistics)
```
Enrollment data → Student stats
Enrollment completion → Completion report
New enrollments → Monthly stats
```

### Module 9 (Payment & Certificate)
```
Payment success → Create enrollment (isPaid = true)
Enrollment completed → Generate certificate
```

### Module 2 (Course Management)
```
Course detail page → Show enrolled students count
Course status → Affect enrollment creation
```

---

## 🧪 Testing

### Test Cases

**Test 1: Get enrollments by course**
```http
GET /api/v1/enrollments/course/1?page=0&size=20
Expected: 200 OK, paginated list
```

**Test 2: Create enrollment**
```http
POST /api/v1/enrollments
{
  "studentId": 1,
  "courseId": 1,
  "isPaid": true,
  "paidAmount": 299000
}
Expected: 200 OK, new enrollment with status ACTIVE
```

**Test 3: Update to completed**
```http
PATCH /api/v1/enrollments/1
{
  "status": "COMPLETED",
  "progress": 100.0
}
Expected: 200 OK, status = COMPLETED, completedAt set
```

**Test 4: Get learning history**
```http
GET /api/v1/enrollments/student/1/history
Expected: 200 OK, full history with stats
```

**Test 5: Get monthly stats**
```http
GET /api/v1/enrollments/stats/monthly?year=2025
Expected: 200 OK, 12 months of data
```

---

## 🔐 Security

### Role-based Access:

```java
// Admin: Full access
@PreAuthorize("hasRole('ADMIN')")
@DeleteMapping("/{id}")
public void removeEnrollment() {}

// Instructor: View own course enrollments
@PreAuthorize("hasRole('INSTRUCTOR')")
@GetMapping("/course/{courseId}")
public Page<EnrollmentDTO> getEnrollmentsByCourse() {
    // Verify courseId belongs to current instructor
}

// Student: View own enrollments only
@PreAuthorize("hasRole('STUDENT')")
@GetMapping("/student/{studentId}")
public Page<EnrollmentDTO> getEnrollmentsByStudent() {
    // Verify studentId == currentUser.id
}
```

---

## 📊 Dashboard Components

### Instructor Dashboard:
```jsx
<StudentList courseId={currentCourse.id}>
  {enrollments.map(e => (
    <StudentCard
      name={e.studentName}
      progress={e.progress}
      lastAccess={e.lastAccessedAt}
      status={e.status}
    />
  ))}
</StudentList>
```

### Student Dashboard:
```jsx
<MyCourses studentId={currentUser.id}>
  {enrollments.map(e => (
    <CourseProgress
      title={e.courseTitle}
      progress={e.progress}
      instructor={e.instructorName}
      status={e.status}
    />
  ))}
</MyCourses>
```

### Admin Dashboard:
```jsx
<MonthlyStatsChart data={monthlyStats.monthlyData}>
  <LineChart>
    <Line dataKey="newStudents" stroke="#8884d8" />
    <Line dataKey="enrollments" stroke="#82ca9d" />
    <Line dataKey="completions" stroke="#ffc658" />
  </LineChart>
</MonthlyStatsChart>
```

---

## ✅ Module Complete

**Files created**: 7/7 ✅
**API endpoints**: 8/8 ✅
**DTOs**: 5/5 ✅
**Service**: 1/1 ✅
**Controller**: 1/1 ✅

**Ready for:**
- Frontend Integration
- Testing
- Production Deployment

---

🎉 **MODULE 6 HOÀN THÀNH!** 🎉

