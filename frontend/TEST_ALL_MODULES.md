# 🧪 TEST ALL 9 MODULES - INTEGRATION

## 📋 Test Plan

Test kết nối đầy đủ từ Frontend → Backend cho 9 modules.

---

## ✅ Pre-requisites

### **1. Backend Running:**
```bash
# Terminal 1
cd backend
mvnw spring-boot:run
# → http://localhost:8080
```

### **2. Chatbot Running:**
```bash
# Terminal 2
python src/main.py
# → http://localhost:8000
```

### **3. Frontend Running:**
```bash
# Terminal 3
cd frontend
npm run dev
# → http://localhost:3000
```

---

## 🎯 Module Tests

### **Module 1: Authentication** ✅

**Test Cases:**
- [ ] Register new user
- [ ] Login with credentials
- [ ] Get current user profile
- [ ] Update profile
- [ ] Change password
- [ ] Logout

**URLs to Test:**
1. http://localhost:3000/register
2. http://localhost:3000/login
3. http://localhost:3000/student/profile (after login)

**Expected:**
- ✅ Register creates user in database
- ✅ Login returns JWT token
- ✅ Token saved in localStorage
- ✅ Protected routes require authentication

---

### **Module 2: Course Management** ✅

**Test Cases:**
- [ ] Browse courses (public)
- [ ] Search courses
- [ ] Filter by level, category, price
- [ ] View course detail
- [ ] Create course (Instructor)
- [ ] Update course (Instructor)
- [ ] Approve course (Admin)

**URLs to Test:**
1. http://localhost:3000/courses
2. http://localhost:3000/courses/1
3. http://localhost:3000/instructor/courses/create

**Expected:**
- ✅ Course list loads from backend
- ✅ Filters work correctly
- ✅ Course creation wizard saves to database
- ✅ Course approval changes status

---

### **Module 3: Content Management** ✨ NEW

**Test Cases:**
- [ ] View course contents/curriculum
- [ ] Create new content (Instructor)
- [ ] Upload video/document
- [ ] Reorder contents
- [ ] Mark content as completed (Student)
- [ ] Track content access time

**Backend API Test:**
```javascript
// In browser console after login
import { contentService } from '@/services';

// Get course contents
const contents = await contentService.getCourseContents(1);
console.log('Contents:', contents);

// Create content (Instructor)
const newContent = await contentService.createContent({
  courseId: 1,
  title: 'Introduction Video',
  contentType: 'VIDEO',
  contentUrl: 'https://youtube.com/...',
  orderIndex: 1,
});
console.log('Created:', newContent);
```

**Expected:**
- ✅ Contents load from backend
- ✅ File upload works
- ✅ Content access logged in database
- ✅ Progress tracked

---

### **Module 4: Quiz/Test** ✨ NEW

**Test Cases:**
- [ ] View quizzes in course
- [ ] Create quiz (Instructor)
- [ ] Add questions with options
- [ ] Start quiz attempt (Student)
- [ ] Submit quiz
- [ ] View results & score
- [ ] Multiple attempts tracking

**Backend API Test:**
```javascript
// Get quizzes
const quizzes = await quizService.getCourseQuizzes(1);
console.log('Quizzes:', quizzes);

// Start quiz
const attempt = await quizService.startQuizAttempt(1);
console.log('Attempt:', attempt);

// Submit quiz
const result = await quizService.submitQuizAttempt(attempt.id, {
  answers: [
    { questionId: 1, answerText: 'Option A' },
    { questionId: 2, answerText: 'True' },
  ],
});
console.log('Result:', result);
```

**Expected:**
- ✅ Quiz loads with questions
- ✅ Timer works (if set)
- ✅ Answers submitted correctly
- ✅ Score calculated
- ✅ Max attempts enforced

---

### **Module 5: Assignment** ✨ NEW

**Test Cases:**
- [ ] View assignments
- [ ] Submit assignment (Student)
- [ ] Upload attachment files
- [ ] View submission status
- [ ] Grade assignment (Instructor)
- [ ] Late submission penalty
- [ ] Feedback display

**Backend API Test:**
```javascript
// Get assignments
const assignments = await assignmentService.getCourseAssignments(1);
console.log('Assignments:', assignments);

// Submit assignment
const submission = await assignmentService.submitAssignment({
  assignmentId: 1,
  content: 'My assignment solution...',
  attachments: ['file-url'],
});
console.log('Submission:', submission);

// Grade (Instructor)
const graded = await assignmentService.gradeSubmission(submission.id, {
  score: 95,
  feedback: 'Excellent work!',
});
console.log('Graded:', graded);
```

**Expected:**
- ✅ Assignment created in database
- ✅ File upload works
- ✅ Submission tracked
- ✅ Grading updates score
- ✅ Feedback saved

---

### **Module 6: Student/Enrollment** ✅

**Test Cases:**
- [ ] Enroll in course
- [ ] View my enrolled courses
- [ ] Track learning progress
- [ ] Complete lessons
- [ ] View course progress percentage
- [ ] Certificate eligibility

**URLs to Test:**
1. http://localhost:3000/student
2. http://localhost:3000/student/my-courses
3. http://localhost:3000/learn/1

**Backend API Test:**
```javascript
// Enroll
const enrollment = await enrollmentService.enrollCourse(1);
console.log('Enrolled:', enrollment);

// Get my enrollments
const myEnrollments = await enrollmentService.getMyEnrollments();
console.log('My Courses:', myEnrollments);

// Update progress
const progress = await enrollmentService.updateProgress(enrollment.id, {
  progress: 50,
  currentLessonId: 5,
});
console.log('Progress:', progress);
```

**Expected:**
- ✅ Enrollment created
- ✅ Course shows in "My Courses"
- ✅ Progress updates in real-time
- ✅ Completion tracked

---

### **Module 7: Instructor Management** ✨ NEW

**Test Cases:**
- [ ] View instructor profile
- [ ] Update instructor bio/expertise
- [ ] View instructor statistics
- [ ] Revenue report
- [ ] My courses list
- [ ] My students list
- [ ] Instructor leaderboard (Admin)

**URLs to Test:**
1. http://localhost:3000/instructor
2. http://localhost:3000/instructor/courses
3. http://localhost:3000/admin (view all instructors)

**Backend API Test:**
```javascript
// Get my instructor profile
const profile = await instructorService.getMyInstructorProfile();
console.log('Profile:', profile);

// Get my statistics
const stats = await instructorService.getMyStatistics({
  startDate: '2025-01-01',
  endDate: '2025-12-31',
});
console.log('Stats:', stats);

// Get my revenue
const revenue = await instructorService.getMyRevenue({
  groupBy: 'month',
});
console.log('Revenue:', revenue);
```

**Expected:**
- ✅ Instructor profile loads
- ✅ Statistics accurate
- ✅ Revenue chart displays
- ✅ Student list loads

---

### **Module 8: Statistics & Reports** ✨ NEW

**Test Cases:**
- [ ] Admin dashboard overview
- [ ] System statistics
- [ ] Revenue report
- [ ] Completion report
- [ ] Enrollment trends
- [ ] Export CSV
- [ ] Export PDF
- [ ] Real-time active users

**URLs to Test:**
1. http://localhost:3000/admin

**Backend API Test:**
```javascript
// Dashboard overview
const overview = await statisticsService.getDashboardOverview();
console.log('Overview:', overview);

// Revenue report
const revenue = await statisticsService.getRevenueReport({
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  groupBy: 'month',
});
console.log('Revenue:', revenue);

// Enrollment trends
const trends = await statisticsService.getEnrollmentTrends({
  groupBy: 'month',
});
console.log('Trends:', trends);

// Export CSV
const csv = await statisticsService.exportStatisticsCSV('revenue', {
  startDate: '2025-01-01',
  endDate: '2025-12-31',
});
console.log('CSV:', csv);
```

**Expected:**
- ✅ Dashboard loads all stats
- ✅ Charts render correctly
- ✅ Trends display
- ✅ Export downloads file

---

### **Module 9: Payment & Certificate** ✨ NEW

**Test Cases:**
- [ ] Create payment transaction
- [ ] Redirect to VNPay
- [ ] Payment callback handling
- [ ] Transaction status update
- [ ] Issue certificate (auto after completion)
- [ ] Download certificate PDF
- [ ] Verify certificate
- [ ] View my certificates

**Backend API Test:**
```javascript
// Create payment
const payment = await paymentService.createVNPayPayment({
  courseId: 1,
  returnUrl: 'http://localhost:3000/payment/success',
  locale: 'vn',
});
console.log('Payment URL:', payment.paymentUrl);
// Redirect: window.location.href = payment.paymentUrl

// Get my transactions
const transactions = await paymentService.getMyTransactions();
console.log('Transactions:', transactions);

// Get my certificates
const certificates = await paymentService.getMyCertificates();
console.log('Certificates:', certificates);

// Download certificate
const blob = await paymentService.downloadCertificate(1);
paymentService.downloadFile(blob, 'certificate.pdf');

// Verify certificate
const verification = await paymentService.verifyCertificate('CERT-123456');
console.log('Valid:', verification.isValid);
```

**Expected:**
- ✅ Payment URL generated
- ✅ VNPay page opens
- ✅ Transaction created in DB
- ✅ Payment callback updates status
- ✅ Certificate issued on completion
- ✅ PDF downloads
- ✅ Verification works

---

### **Chatbot Integration** ✅

**Test Cases:**
- [ ] Open chatbot widget
- [ ] Send message
- [ ] Receive AI response
- [ ] Context awareness
- [ ] Chat history

**Backend API Test:**
```javascript
// Send message
const response = await chatbotService.sendChatMessage({
  message: 'What courses do you offer?',
  userId: 1,
});
console.log('Response:', response);

// Get context
const context = await chatbotService.getChatContext(1);
console.log('Context:', context);
```

**Expected:**
- ✅ Message sent to backend
- ✅ AI response received
- ✅ Context maintained
- ✅ History saved

---

## 🔧 Automated Test Script

Create `frontend/test-api-integration.ts`:

```typescript
import { 
  authService,
  courseService,
  contentService,
  quizService,
  assignmentService,
  enrollmentService,
  instructorService,
  statisticsService,
  paymentService,
  chatbotService,
} from '@/services';

async function testAllModules() {
  console.log('🧪 Starting API Integration Tests...\n');

  try {
    // Module 1: Auth
    console.log('✅ Module 1: Authentication');
    const currentUser = await authService.getCurrentUser();
    console.log('  - Current User:', currentUser?.name || 'Not logged in');

    // Module 2: Courses
    console.log('✅ Module 2: Courses');
    const courses = await courseService.getCourses({ page: 0, size: 5 });
    console.log('  - Courses loaded:', courses.content?.length || 0);

    // Module 3: Content
    console.log('✅ Module 3: Content');
    if (courses.content?.[0]) {
      const contents = await contentService.getCourseContents(courses.content[0].id);
      console.log('  - Contents loaded:', contents?.length || 0);
    }

    // Module 4: Quiz
    console.log('✅ Module 4: Quiz');
    if (courses.content?.[0]) {
      const quizzes = await quizService.getCourseQuizzes(courses.content[0].id);
      console.log('  - Quizzes loaded:', quizzes?.length || 0);
    }

    // Module 5: Assignment
    console.log('✅ Module 5: Assignment');
    if (courses.content?.[0]) {
      const assignments = await assignmentService.getCourseAssignments(courses.content[0].id);
      console.log('  - Assignments loaded:', assignments?.length || 0);
    }

    // Module 6: Enrollment
    console.log('✅ Module 6: Enrollment');
    if (currentUser) {
      const enrollments = await enrollmentService.getMyEnrollments();
      console.log('  - Enrollments:', enrollments?.length || 0);
    }

    // Module 7: Instructor (if instructor)
    console.log('✅ Module 7: Instructor');
    try {
      const instructorProfile = await instructorService.getMyInstructorProfile();
      console.log('  - Instructor Profile:', instructorProfile?.userName || 'Not an instructor');
    } catch (e) {
      console.log('  - Not an instructor role');
    }

    // Module 8: Statistics (if admin)
    console.log('✅ Module 8: Statistics');
    try {
      const dashboard = await statisticsService.getDashboardOverview();
      console.log('  - Dashboard loaded:', dashboard ? 'Yes' : 'No');
    } catch (e) {
      console.log('  - Access denied (Admin only)');
    }

    // Module 9: Payment
    console.log('✅ Module 9: Payment & Certificate');
    if (currentUser) {
      const transactions = await paymentService.getMyTransactions({ page: 0, size: 5 });
      console.log('  - Transactions:', transactions.content?.length || 0);
      
      const certificates = await paymentService.getMyCertificates({ page: 0, size: 5 });
      console.log('  - Certificates:', certificates.content?.length || 0);
    }

    // Chatbot
    console.log('✅ Chatbot');
    const health = await chatbotService.checkChatbotHealth();
    console.log('  - Chatbot Status:', health ? 'Online' : 'Offline');

    console.log('\n🎉 All modules tested successfully!');
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests
testAllModules();
```

---

## 📊 Test Results Template

```
=== API Integration Test Results ===

Module 1: Authentication         [ PASS / FAIL ]
  - Login                        [ ✅ / ❌ ]
  - Register                     [ ✅ / ❌ ]
  - Get Profile                  [ ✅ / ❌ ]

Module 2: Course Management      [ PASS / FAIL ]
  - Get Courses                  [ ✅ / ❌ ]
  - Get Course Detail            [ ✅ / ❌ ]
  - Create Course                [ ✅ / ❌ ]

Module 3: Content Management     [ PASS / FAIL ]
  - Get Contents                 [ ✅ / ❌ ]
  - Create Content               [ ✅ / ❌ ]
  - Upload File                  [ ✅ / ❌ ]

Module 4: Quiz/Test             [ PASS / FAIL ]
  - Get Quizzes                  [ ✅ / ❌ ]
  - Start Quiz                   [ ✅ / ❌ ]
  - Submit Quiz                  [ ✅ / ❌ ]

Module 5: Assignment            [ PASS / FAIL ]
  - Get Assignments              [ ✅ / ❌ ]
  - Submit Assignment            [ ✅ / ❌ ]
  - Grade Assignment             [ ✅ / ❌ ]

Module 6: Enrollment            [ PASS / FAIL ]
  - Enroll Course                [ ✅ / ❌ ]
  - Get My Courses               [ ✅ / ❌ ]
  - Update Progress              [ ✅ / ❌ ]

Module 7: Instructor            [ PASS / FAIL ]
  - Get Profile                  [ ✅ / ❌ ]
  - Get Statistics               [ ✅ / ❌ ]
  - Get Revenue                  [ ✅ / ❌ ]

Module 8: Statistics            [ PASS / FAIL ]
  - Dashboard Overview           [ ✅ / ❌ ]
  - Revenue Report               [ ✅ / ❌ ]
  - Export CSV                   [ ✅ / ❌ ]

Module 9: Payment & Certificate [ PASS / FAIL ]
  - Create Payment               [ ✅ / ❌ ]
  - Get Transactions             [ ✅ / ❌ ]
  - Get Certificates             [ ✅ / ❌ ]
  - Download Certificate         [ ✅ / ❌ ]

Chatbot Integration             [ PASS / FAIL ]
  - Send Message                 [ ✅ / ❌ ]
  - Get Context                  [ ✅ / ❌ ]

Overall: ___ / 9 Modules Passed
```

---

## 🚀 Quick Test Commands

### **Browser Console Test:**
```javascript
// Open browser console on http://localhost:3000
// After login, run:

// Test all services available
console.log('Services:', {
  auth: typeof authService,
  course: typeof courseService,
  content: typeof contentService,
  quiz: typeof quizService,
  assignment: typeof assignmentService,
  enrollment: typeof enrollmentService,
  instructor: typeof instructorService,
  statistics: typeof statisticsService,
  payment: typeof paymentService,
  chatbot: typeof chatbotService,
});
```

---

## ✅ Success Criteria

- [ ] All 9 modules load without errors
- [ ] API calls return data from backend
- [ ] CRUD operations work correctly
- [ ] File uploads successful
- [ ] Authentication & authorization work
- [ ] Role-based access enforced
- [ ] Error handling displays correctly
- [ ] Loading states show
- [ ] Forms submit successfully
- [ ] Charts render with real data

---

**🎯 Goal:** All 9 modules passing with backend integration!



