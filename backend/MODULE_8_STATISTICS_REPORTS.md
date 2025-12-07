# MODULE 8: THỐNG KÊ - BÁO CÁO (STATISTICS & REPORTS) (STATISTICS & REPORTS)

## 📋 Tổng quan

Module quản lý thống kê và báo cáo cho Admin Dashboard của hệ thống Elearning.

### Tính năng chính:

✅ **Dashboard Overview:**
- Tổng số khóa học, học viên, giảng viên
- Doanh thu tổng/tháng/năm
- Số giao dịch theo status
- Tỷ lệ hoàn thành khóa học
- Số chứng chỉ đã cấp

✅ **Course Statistics:**
- Số lượt đăng ký
- Tỷ lệ hoàn thành
- Tiến độ trung bình
- Doanh thu từ khóa học
- Số chứng chỉ đã cấp

✅ **Instructor Statistics:**
- Số khóa học đã tạo
- Tổng số học viên
- Doanh thu từ khóa học
- Tỷ lệ hoàn thành trung bình

✅ **Student Statistics:**
- Số khóa học đã đăng ký
- Tiến độ học tập
- Số chứng chỉ đã nhận
- Điểm số trung bình

✅ **Revenue Reports:**
- Doanh thu theo khoảng thời gian
- Top courses bán chạy
- Doanh thu theo tháng
- Phương thức thanh toán

✅ **Completion Reports:**
- Tỷ lệ hoàn thành tổng thể
- Completion rate theo khóa học
- Completion rate theo tháng

---

## 📁 Cấu trúc Files

```
DoAn-main/src/main/java/com/coursemgmt/
├── dto/
│   ├── DashboardStatsDTO.java
│   ├── CourseStatsDTO.java
│   ├── InstructorStatsDTO.java
│   ├── StudentStatsDTO.java
│   ├── RevenueStatsDTO.java
│   └── CompletionReportDTO.java
├── service/
│   └── StatisticsService.java
├── controller/
│   └── StatisticsController.java
└── repository/
    ├── CourseRepository.java (updated)
    ├── TransactionRepository.java (updated)
    └── EnrollmentRepository.java (updated)
```

---

## 🔌 API Endpoints

### 1. Dashboard Overview

```http
GET /api/v1/statistics/dashboard
```

**Response:**
```json
{
  "totalCourses": 150,
  "totalStudents": 5000,
  "totalInstructors": 50,
  "totalEnrollments": 8000,
  "totalCertificates": 2500,
  "totalRevenue": 500000000,
  "monthlyRevenue": 45000000,
  "yearlyRevenue": 350000000,
  "activeCourses": 120,
  "pendingCourses": 15,
  "draftCourses": 15,
  "successfulTransactions": 7500,
  "pendingTransactions": 200,
  "failedTransactions": 300,
  "averageCompletionRate": 62.5,
  "completedEnrollments": 5000,
  "inProgressEnrollments": 3000
}
```

### 2. Course Statistics

```http
GET /api/v1/statistics/course/1
```

**Response:**
```json
{
  "courseId": 1,
  "courseTitle": "Lập trình Python cơ bản",
  "instructorName": "Nguyen Van A",
  "totalEnrollments": 500,
  "activeStudents": 300,
  "completedStudents": 200,
  "certificatesIssued": 180,
  "completionRate": 40.0,
  "averageProgress": 65.5,
  "averageScore": 82.3,
  "totalRevenue": 149500000,
  "totalTransactions": 500,
  "averageRating": 4.5,
  "totalReviews": 250
}
```

### 3. Instructor Statistics

```http
GET /api/v1/statistics/instructor/1
```

**Response:**
```json
{
  "instructorId": 1,
  "instructorName": "Nguyen Van A",
  "email": "instructor@example.com",
  "totalCourses": 10,
  "publishedCourses": 8,
  "draftCourses": 2,
  "totalStudents": 2500,
  "activeStudents": 1800,
  "certificatesIssued": 1000,
  "totalRevenue": 250000000,
  "averageCourseRating": 4.6,
  "averageCompletionRate": 55.5
}
```

### 4. Student Statistics

```http
GET /api/v1/statistics/student/1
```

**Response:**
```json
{
  "studentId": 1,
  "studentName": "Tran Thi B",
  "email": "student@example.com",
  "totalEnrollments": 15,
  "completedCourses": 8,
  "inProgressCourses": 7,
  "averageProgress": 68.5,
  "completionRate": 53.3,
  "averageScore": 85.2,
  "totalTestsTaken": 45,
  "totalCertificates": 8,
  "lastAccessDate": "2025-11-13",
  "totalLearningHours": 120
}
```

### 5. Revenue Report

```http
GET /api/v1/statistics/revenue?startDate=2025-01-01T00:00:00&endDate=2025-12-31T23:59:59
```

**Response:**
```json
{
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "totalRevenue": 500000000,
  "totalTransactions": 10000,
  "averageTransactionValue": 50000,
  "monthlyRevenue": [
    {
      "year": 2025,
      "month": 1,
      "revenue": 35000000,
      "transactions": 700
    },
    {
      "year": 2025,
      "month": 2,
      "revenue": 42000000,
      "transactions": 840
    }
  ],
  "topSellingCourses": [
    {
      "courseId": 5,
      "courseTitle": "Web Development với React",
      "totalSales": 1500,
      "revenue": 750000000
    },
    {
      "courseId": 3,
      "courseTitle": "Python cho Data Science",
      "totalSales": 1200,
      "revenue": 600000000
    }
  ],
  "vnpayTransactions": 8000,
  "momoTransactions": 1500,
  "bankTransferTransactions": 500
}
```

### 6. Completion Report

```http
GET /api/v1/statistics/completion
```

**Response:**
```json
{
  "totalEnrollments": 10000,
  "completedEnrollments": 6000,
  "inProgressEnrollments": 4000,
  "overallCompletionRate": 60.0,
  "courseCompletions": [
    {
      "courseId": 1,
      "courseTitle": "Lập trình Python",
      "totalEnrollments": 500,
      "completed": 320,
      "completionRate": 64.0,
      "averageProgress": 75.5
    }
  ],
  "monthlyCompletions": [
    {
      "year": 2025,
      "month": 1,
      "enrollments": 800,
      "completions": 480,
      "completionRate": 60.0
    }
  ]
}
```

---

## 📊 Use Cases

### Admin Dashboard

```javascript
// Get dashboard overview
const response = await fetch('http://localhost:8080/api/v1/statistics/dashboard');
const stats = await response.json();

// Display on admin dashboard
console.log(`Total Revenue: ${stats.totalRevenue}`);
console.log(`Total Students: ${stats.totalStudents}`);
console.log(`Completion Rate: ${stats.averageCompletionRate}%`);
```

### Course Analytics Page

```javascript
// Get statistics for specific course
const courseId = 5;
const response = await fetch(
  `http://localhost:8080/api/v1/statistics/course/${courseId}`
);
const courseStats = await response.json();

// Show to instructor
console.log(`Students: ${courseStats.totalEnrollments}`);
console.log(`Completion: ${courseStats.completionRate}%`);
console.log(`Revenue: ${courseStats.totalRevenue}`);
```

### Instructor Profile

```javascript
// Get instructor statistics
const instructorId = 10;
const response = await fetch(
  `http://localhost:8080/api/v1/statistics/instructor/${instructorId}`
);
const instructorStats = await response.json();

// Display instructor achievements
console.log(`Total Courses: ${instructorStats.totalCourses}`);
console.log(`Total Students: ${instructorStats.totalStudents}`);
console.log(`Total Revenue: ${instructorStats.totalRevenue}`);
```

### Student Progress Dashboard

```javascript
// Get student learning statistics
const studentId = 25;
const response = await fetch(
  `http://localhost:8080/api/v1/statistics/student/${studentId}`
);
const studentStats = await response.json();

// Show student progress
console.log(`Completed: ${studentStats.completedCourses}/${studentStats.totalEnrollments}`);
console.log(`Average Progress: ${studentStats.averageProgress}%`);
console.log(`Certificates: ${studentStats.totalCertificates}`);
```

### Revenue Analytics

```javascript
// Get revenue report for last 3 months
const endDate = new Date();
const startDate = new Date();
startDate.setMonth(startDate.getMonth() - 3);

const response = await fetch(
  `http://localhost:8080/api/v1/statistics/revenue?` +
  `startDate=${startDate.toISOString()}&` +
  `endDate=${endDate.toISOString()}`
);
const revenueReport = await response.json();

// Display charts
console.log(`Total Revenue: ${revenueReport.totalRevenue}`);
console.log(`Average Transaction: ${revenueReport.averageTransactionValue}`);
revenueReport.monthlyRevenue.forEach(month => {
  console.log(`${month.month}/${month.year}: ${month.revenue}`);
});
```

---

## 🔧 Setup & Configuration

### Database Queries

Tất cả queries đã được optimize trong Repository:
- Sử dụng JPA native queries
- Aggregate functions (COUNT, SUM, AVG)
- GROUP BY cho monthly stats
- Efficient JOINs

### Performance Considerations

```java
// Pagination cho large datasets
Page<CourseStatsDTO> courses = repository.findAll(pageable);

// Caching với Spring Cache (optional)
@Cacheable("dashboardStats")
public DashboardStatsDTO getDashboardStats() {
    // ...
}

// Async processing cho heavy reports
@Async
public CompletableFuture<RevenueStatsDTO> generateRevenueReport() {
    // ...
}
```

---

## 📈 Charts & Visualization

### Frontend Integration

Các DTO đã được thiết kế để dễ dàng integrate với charting libraries:

**Chart.js:**
```javascript
// Revenue by month
const chartData = {
  labels: stats.monthlyRevenue.map(m => `${m.month}/${m.year}`),
  datasets: [{
    label: 'Revenue',
    data: stats.monthlyRevenue.map(m => m.revenue)
  }]
};
```

**Recharts (React):**
```jsx
<LineChart data={stats.monthlyRevenue}>
  <XAxis dataKey="month" />
  <YAxis />
  <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
</LineChart>
```

---

## 🧪 Testing

### Test với HTTP Client

```http
### Test Dashboard Stats
GET http://localhost:8080/api/v1/statistics/dashboard

### Test Course Stats
GET http://localhost:8080/api/v1/statistics/course/1

### Test Instructor Stats
GET http://localhost:8080/api/v1/statistics/instructor/1

### Test Student Stats
GET http://localhost:8080/api/v1/statistics/student/1

### Test Revenue Report (Last year)
GET http://localhost:8080/api/v1/statistics/revenue?startDate=2024-01-01T00:00:00&endDate=2024-12-31T23:59:59

### Test Completion Report
GET http://localhost:8080/api/v1/statistics/completion
```

---

## 📊 Admin Dashboard Layout

### Recommended Components:

```
┌─────────────────────────────────────────┐
│         ADMIN DASHBOARD                 │
├─────────────────────────────────────────┤
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │
│  │ 150 │ │5000 │ │ 50  │ │8000 │      │
│  │Cour │ │Stud │ │Inst │ │Enro │      │
│  └─────┘ └─────┘ └─────┘ └─────┘      │
├─────────────────────────────────────────┤
│  Revenue Chart (Monthly)                │
│  ┌─────────────────────────────────┐   │
│  │    📊 Line/Bar Chart            │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  Top Selling Courses                    │
│  1. React Development - 1500 sales      │
│  2. Python Data Science - 1200 sales    │
│  3. Web Design - 1000 sales             │
├─────────────────────────────────────────┤
│  Completion Rate                        │
│  ████████████░░░░░░ 60%                │
└─────────────────────────────────────────┘
```

---

## 🔐 Security & Access Control

### Role-Based Access:

```java
// Admin only - see all statistics
@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/dashboard")
public DashboardStatsDTO getDashboardStats() { }

// Instructor - see own statistics only
@PreAuthorize("hasRole('INSTRUCTOR')")
@GetMapping("/instructor/{instructorId}")
public InstructorStatsDTO getInstructorStats(
    @PathVariable Long instructorId,
    @AuthenticationPrincipal User currentUser
) {
    // Verify instructorId == currentUser.id
}

// Student - see own statistics only
@PreAuthorize("hasRole('STUDENT')")
@GetMapping("/student/{studentId}")
public StudentStatsDTO getStudentStats(
    @PathVariable Long studentId,
    @AuthenticationPrincipal User currentUser
) {
    // Verify studentId == currentUser.id
}
```

---

## 📝 Next Steps

### Short Term:
- [ ] Add caching cho dashboard stats
- [ ] Implement real-time updates (WebSocket)
- [ ] Add export to Excel/PDF
- [ ] Add email reports

### Long Term:
- [ ] Advanced analytics (ML predictions)
- [ ] Custom date range filters
- [ ] Comparison reports (YoY, MoM)
- [ ] Student engagement metrics
- [ ] Course recommendations based on stats

---

## ✅ Module Complete

**Files created**: 10/10 ✅
**API endpoints**: 6/6 ✅
**DTOs**: 6/6 ✅
**Service**: 1/1 ✅
**Controller**: 1/1 ✅

**Ready for:**
- Frontend Integration
- Testing
- Production Deployment

---

🎉 **MODULE 7 HOÀN THÀNH!** 🎉

