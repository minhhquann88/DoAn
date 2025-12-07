# MODULE 7: QUẢN LÝ GIẢNG VIÊN (INSTRUCTOR MANAGEMENT)

## 📋 Tổng quan

Module quản lý giảng viên trong hệ thống Elearning (Admin functions).

### Tính năng chính:

✅ **Quản lý Giảng viên:**
- Danh sách tất cả giảng viên (Admin)
- Thêm giảng viên mới
- Sửa thông tin giảng viên
- Xóa giảng viên
- Suspend/Active giảng viên

✅ **Thống kê Giảng viên:**
- Tổng số khóa học đã tạo
- Số khóa học đã publish
- Tổng số học viên
- Doanh thu từ khóa học
- Đánh giá trung bình

✅ **Quản lý Khóa học:**
- Xem danh sách khóa học của giảng viên
- Thống kê performance

---

## 📁 Cấu trúc Files

```
DoAn-main/src/main/java/com/coursemgmt/
├── dto/
│   ├── InstructorDTO.java
│   ├── InstructorCreateRequest.java
│   └── InstructorUpdateRequest.java
├── service/
│   └── InstructorService.java
└── controller/
    └── InstructorController.java
```

---

## 🔌 API Endpoints (8 endpoints)

### 1. Danh sách giảng viên

```http
GET /api/v1/instructors?page=0&size=20
```

**Response:**
```json
{
  "content": [
    {
      "id": 10,
      "fullName": "Nguyen Van Teacher",
      "email": "teacher@example.com",
      "phone": "+84123456789",
      "bio": "Experienced Python developer with 10 years...",
      "expertise": "Python, Django, Machine Learning",
      "profileImage": "https://example.com/images/teacher.jpg",
      "totalCourses": 15,
      "publishedCourses": 12,
      "totalStudents": 2500,
      "averageRating": 4.8,
      "totalRevenue": 250000000,
      "accountStatus": "ACTIVE",
      "joinedAt": "2023-01-15T10:00:00",
      "lastLoginAt": "2025-11-13T09:30:00"
    }
  ],
  "pageable": {...},
  "totalElements": 50,
  "totalPages": 3
}
```

### 2. Chi tiết giảng viên

```http
GET /api/v1/instructors/{id}
```

**Response:** Single InstructorDTO

### 3. Chi tiết với thống kê

```http
GET /api/v1/instructors/{id}/stats
```

**Response:** InstructorDTO with full statistics

### 4. Tạo giảng viên mới

```http
POST /api/v1/instructors
Content-Type: application/json

{
  "fullName": "Le Thi Teacher",
  "email": "newteacher@example.com",
  "password": "SecurePassword123!",
  "phone": "+84987654321",
  "bio": "Expert in Web Development",
  "expertise": "React, Node.js, MongoDB",
  "profileImage": "https://example.com/images/new-teacher.jpg"
}
```

**Response:**
```json
{
  "id": 51,
  "fullName": "Le Thi Teacher",
  "email": "newteacher@example.com",
  "phone": "+84987654321",
  "bio": "Expert in Web Development",
  "expertise": "React, Node.js, MongoDB",
  "totalCourses": 0,
  "publishedCourses": 0,
  "accountStatus": "ACTIVE",
  "joinedAt": "2025-11-13T15:00:00"
}
```

### 5. Cập nhật giảng viên

```http
PUT /api/v1/instructors/{id}
Content-Type: application/json

{
  "fullName": "Le Thi Teacher Updated",
  "phone": "+84987654321",
  "bio": "Senior Web Developer with 12 years experience",
  "expertise": "React, Node.js, MongoDB, AWS",
  "profileImage": "https://example.com/images/updated.jpg",
  "accountStatus": "ACTIVE"
}
```

**Response:** Updated InstructorDTO

### 6. Xóa giảng viên

```http
DELETE /api/v1/instructors/{id}
```

**Response:** 
- 204 No Content (if success)
- 400 Bad Request (if has courses)

**Error Response:**
```json
{
  "error": "Cannot delete instructor with existing courses",
  "message": "Please reassign or delete courses first"
}
```

### 7. Cập nhật trạng thái

```http
PATCH /api/v1/instructors/{id}/status?status=SUSPENDED
```

**Response:** Updated InstructorDTO

### 8. Danh sách khóa học của giảng viên

```http
GET /api/v1/instructors/{id}/courses
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "Lập trình Python cơ bản",
    "status": "PUBLISHED",
    "price": 299000,
    "enrollmentCount": 500,
    "averageRating": 4.5,
    "createdAt": "2024-01-15T10:00:00"
  },
  {
    "id": 2,
    "title": "Django Web Framework",
    "status": "DRAFT",
    "price": 499000,
    "enrollmentCount": 0,
    "createdAt": "2025-11-01T10:00:00"
  }
]
```

---

## 📊 Use Cases

### Use Case 1: Admin xem danh sách giảng viên

```javascript
// Admin panel - Instructor management page
const response = await fetch(
  'http://localhost:8080/api/v1/instructors?page=0&size=20'
);
const data = await response.json();

console.log(`Total instructors: ${data.totalElements}`);
data.content.forEach(instructor => {
  console.log(`${instructor.fullName} - ${instructor.totalCourses} courses`);
});
```

### Use Case 2: Admin thêm giảng viên mới

```javascript
// Admin adds new instructor
const response = await fetch('http://localhost:8080/api/v1/instructors', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullName: 'New Teacher',
    email: 'new@example.com',
    password: 'SecurePass123!',
    phone: '+84123456789',
    bio: 'Expert developer',
    expertise: 'React, Node.js'
  })
});

const newInstructor = await response.json();
console.log(`Created instructor ID: ${newInstructor.id}`);

// Send welcome email with login credentials
sendWelcomeEmail(newInstructor.email);
```

### Use Case 3: Admin cập nhật thông tin giảng viên

```javascript
// Admin updates instructor profile
const instructorId = 10;
const response = await fetch(
  `http://localhost:8080/api/v1/instructors/${instructorId}`,
  {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Updated Name',
      phone: '+84987654321',
      bio: 'Updated bio',
      expertise: 'Python, Django, ML'
    })
  }
);

const updated = await response.json();
console.log('Instructor updated successfully');
```

### Use Case 4: Admin suspend giảng viên

```javascript
// Admin suspends instructor for policy violation
const instructorId = 10;
const response = await fetch(
  `http://localhost:8080/api/v1/instructors/${instructorId}/status?status=SUSPENDED`,
  { method: 'PATCH' }
);

const updated = await response.json();
console.log(`Status: ${updated.accountStatus}`);

// Notify instructor
sendSuspensionEmail(updated.email, reason);
```

### Use Case 5: Admin xóa giảng viên

```javascript
// Admin tries to delete instructor
const instructorId = 10;

try {
  await fetch(`http://localhost:8080/api/v1/instructors/${instructorId}`, {
    method: 'DELETE'
  });
  
  console.log('Instructor deleted successfully');
} catch (error) {
  if (error.response.status === 400) {
    console.log('Cannot delete: instructor has courses');
    // Show dialog to reassign courses first
    showCourseReassignmentDialog(instructorId);
  }
}
```

### Use Case 6: Xem performance giảng viên

```javascript
// Admin views instructor performance
const instructorId = 10;
const response = await fetch(
  `http://localhost:8080/api/v1/instructors/${instructorId}/stats`
);
const stats = await response.json();

console.log(`Instructor: ${stats.fullName}`);
console.log(`Total Courses: ${stats.totalCourses}`);
console.log(`Total Students: ${stats.totalStudents}`);
console.log(`Total Revenue: ${stats.totalRevenue.toLocaleString()} VND`);
console.log(`Average Rating: ${stats.averageRating}/5`);
```

### Use Case 7: Xem khóa học của giảng viên

```javascript
// Admin reviews instructor's courses
const instructorId = 10;
const response = await fetch(
  `http://localhost:8080/api/v1/instructors/${instructorId}/courses`
);
const courses = await response.json();

console.log(`${courses.length} courses found`);
courses.forEach(course => {
  console.log(`- ${course.title} [${course.status}] - ${course.enrollmentCount} students`);
});
```

---

## 🔧 Business Logic

### Instructor Account Status

```
ACTIVE:     Can create/edit courses, access dashboard
INACTIVE:   Cannot create new courses, existing courses hidden
SUSPENDED:  Account locked, all courses unavailable
```

### Deletion Rules

```java
// Cannot delete if instructor has courses
if (instructor.getCourses().size() > 0) {
    throw new RuntimeException(
        "Cannot delete instructor with existing courses"
    );
}

// Solution: 
// 1. Reassign courses to another instructor
// 2. Delete all courses first
// 3. Or soft-delete (keep data, mark as DELETED)
```

### Revenue Calculation

```java
// Total revenue from all instructor's courses
double totalRevenue = 0;
for (Course course : instructor.getCourses()) {
    List<Transaction> transactions = 
        transactionRepository.findSuccessfulByCourse(course.getId());
    totalRevenue += transactions.stream()
        .mapToDouble(Transaction::getAmount)
        .sum();
}
```

---

## 📈 Integration với modules khác

### Module 2 (Course Management)
```
Instructor manages courses
Course.instructor → InstructorDTO
```

### Module 6 (Student Management)
```
Instructor views enrollments in their courses
Enrollment.course.instructor → InstructorDTO
```

### Module 8 (Statistics)
```
Instructor statistics
Revenue from instructor's courses
```

### Module 9 (Payment)
```
Revenue calculation from transactions
Instructor earnings report
```

---

## 🧪 Testing

### Test Cases

**Test 1: List all instructors**
```http
GET /api/v1/instructors?page=0&size=20
Expected: 200 OK, paginated list
```

**Test 2: Create new instructor**
```http
POST /api/v1/instructors
{
  "fullName": "Test Teacher",
  "email": "test@example.com",
  "password": "Pass123!",
  "phone": "+84123456789"
}
Expected: 200 OK, new instructor created
```

**Test 3: Update instructor**
```http
PUT /api/v1/instructors/1
{
  "fullName": "Updated Name",
  "bio": "Updated bio"
}
Expected: 200 OK, instructor updated
```

**Test 4: Delete instructor without courses**
```http
DELETE /api/v1/instructors/1
Expected: 204 No Content
```

**Test 5: Delete instructor with courses**
```http
DELETE /api/v1/instructors/10
Expected: 400 Bad Request, error message
```

**Test 6: Suspend instructor**
```http
PATCH /api/v1/instructors/10/status?status=SUSPENDED
Expected: 200 OK, status = SUSPENDED
```

**Test 7: Get instructor courses**
```http
GET /api/v1/instructors/10/courses
Expected: 200 OK, list of courses
```

---

## 🔐 Security

### Admin-only Access:

```java
// All endpoints require ADMIN role
@PreAuthorize("hasRole('ADMIN')")
@RestController
@RequestMapping("/api/v1/instructors")
public class InstructorController {
    // All methods admin-only
}
```

### Password Security:

```java
// When creating instructor
String hashedPassword = passwordEncoder.encode(request.getPassword());
instructor.setPassword(hashedPassword);

// Generate temporary password
String tempPassword = generateRandomPassword();
sendWelcomeEmail(instructor.getEmail(), tempPassword);
```

---

## 📊 Admin Dashboard Components

### Instructor List:
```jsx
<InstructorTable>
  {instructors.map(inst => (
    <InstructorRow key={inst.id}>
      <Avatar src={inst.profileImage} />
      <Name>{inst.fullName}</Name>
      <Courses>{inst.totalCourses}</Courses>
      <Students>{inst.totalStudents}</Students>
      <Revenue>{formatCurrency(inst.totalRevenue)}</Revenue>
      <Status status={inst.accountStatus}>
        {inst.accountStatus}
      </Status>
      <Actions>
        <EditButton onClick={() => editInstructor(inst.id)} />
        <SuspendButton onClick={() => suspendInstructor(inst.id)} />
        <DeleteButton onClick={() => deleteInstructor(inst.id)} />
      </Actions>
    </InstructorRow>
  ))}
</InstructorTable>
```

### Instructor Stats Card:
```jsx
<InstructorStatsCard instructorId={10}>
  <Avatar size="large" />
  <Name>{instructor.fullName}</Name>
  <Email>{instructor.email}</Email>
  
  <StatsGrid>
    <Stat label="Courses" value={instructor.totalCourses} />
    <Stat label="Students" value={instructor.totalStudents} />
    <Stat label="Revenue" value={formatCurrency(instructor.totalRevenue)} />
    <Stat label="Rating" value={`${instructor.averageRating}/5`} />
  </StatsGrid>
  
  <CoursesList courses={instructor.courses} />
</InstructorStatsCard>
```

### Add/Edit Instructor Form:
```jsx
<InstructorForm onSubmit={handleSubmit}>
  <Input name="fullName" label="Full Name" required />
  <Input name="email" type="email" label="Email" required />
  <Input name="password" type="password" label="Password" required />
  <Input name="phone" label="Phone" />
  <TextArea name="bio" label="Bio" rows={4} />
  <Input name="expertise" label="Expertise" />
  <ImageUpload name="profileImage" label="Profile Image" />
  
  <Button type="submit">
    {isEdit ? 'Update' : 'Create'} Instructor
  </Button>
</InstructorForm>
```

---

## ✅ Module Complete

**Files created**: 5/5 ✅
**API endpoints**: 8/8 ✅
**DTOs**: 3/3 ✅
**Service**: 1/1 ✅
**Controller**: 1/1 ✅

**Ready for:**
- Frontend Integration
- Testing
- Production Deployment

---

🎉 **MODULE 7 HOÀN THÀNH!** 🎉

