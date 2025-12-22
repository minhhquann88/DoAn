# 🚀 QUICK MODULE TEST - 5 Minutes

## ✅ Test tất cả 9 modules trong 5 phút!

---

## 📋 Prerequisites

**Check if running:**
- ✅ Frontend: http://localhost:3000
- ✅ Backend: http://localhost:8080
- ✅ Chatbot: http://localhost:8000

---

## 🧪 Quick Test (Browser Console)

### **Step 1: Open Browser**
```
http://localhost:3000
```

### **Step 2: Login**
1. Go to http://localhost:3000/login
2. Login with test account

### **Step 3: Open Console**
Press `F12` → Console tab

### **Step 4: Run Test Script**
```javascript
// Copy-paste this into console:

async function quickTest() {
  console.log('🧪 Testing all 9 modules...\n');
  
  // Import services (if not already available)
  const apiClient = (await import('/src/lib/api')).default;
  
  // Test 1: Auth
  console.log('1. Auth:', localStorage.getItem('token') ? '✅' : '❌');
  
  // Test 2: Courses
  try {
    const res = await fetch('http://localhost:8080/api/courses?page=0&size=5');
    console.log('2. Courses:', res.ok ? '✅' : '❌');
  } catch (e) { console.log('2. Courses: ❌'); }
  
  // Test 3: Contents
  try {
    const res = await fetch('http://localhost:8080/api/courses/1/contents', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    console.log('3. Contents:', res.ok ? '✅' : '❌');
  } catch (e) { console.log('3. Contents: ❌'); }
  
  // Test 4: Quizzes
  try {
    const res = await fetch('http://localhost:8080/api/courses/1/quizzes', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    console.log('4. Quizzes:', res.ok ? '✅' : '❌');
  } catch (e) { console.log('4. Quizzes: ❌'); }
  
  // Test 5: Assignments
  try {
    const res = await fetch('http://localhost:8080/api/courses/1/assignments', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    console.log('5. Assignments:', res.ok ? '✅' : '❌');
  } catch (e) { console.log('5. Assignments: ❌'); }
  
  // Test 6: Enrollments
  try {
    const res = await fetch('http://localhost:8080/api/enrollments/my-courses', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    console.log('6. Enrollments:', res.ok ? '✅' : '❌');
  } catch (e) { console.log('6. Enrollments: ❌'); }
  
  // Test 7: Instructor
  try {
    const res = await fetch('http://localhost:8080/api/instructors/me', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    console.log('7. Instructor:', res.ok ? '✅' : '⊘ (not instructor)');
  } catch (e) { console.log('7. Instructor: ⊘'); }
  
  // Test 8: Statistics
  try {
    const res = await fetch('http://localhost:8080/api/statistics/dashboard', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    console.log('8. Statistics:', res.ok ? '✅' : '⊘ (not admin)');
  } catch (e) { console.log('8. Statistics: ⊘'); }
  
  // Test 9: Payment
  try {
    const res = await fetch('http://localhost:8080/api/transactions/my-transactions?page=0&size=5', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    console.log('9. Payment:', res.ok ? '✅' : '❌');
  } catch (e) { console.log('9. Payment: ❌'); }
  
  // Test Chatbot
  try {
    const res = await fetch('http://localhost:8000/health');
    console.log('Chatbot:', res.ok ? '✅' : '❌');
  } catch (e) { console.log('Chatbot: ❌'); }
  
  console.log('\n🎉 Test complete!');
}

quickTest();
```

---

## 📱 Manual Test (Click Through)

### **Test Flow:**

1. **Homepage** → http://localhost:3000
   - [ ] Hero section loads
   - [ ] Featured courses display
   - [ ] Navigation works

2. **Courses** → http://localhost:3000/courses
   - [ ] Course list loads
   - [ ] Filters work
   - [ ] Search works

3. **Course Detail** → http://localhost:3000/courses/1
   - [ ] Course info displays
   - [ ] Curriculum shows
   - [ ] Enroll button visible

4. **Login** → http://localhost:3000/login
   - [ ] Login form works
   - [ ] JWT token saved
   - [ ] Redirect to dashboard

5. **Student Dashboard** → http://localhost:3000/student
   - [ ] Stats display
   - [ ] My courses load
   - [ ] Recent activity shows

6. **My Courses** → http://localhost:3000/student/my-courses
   - [ ] Enrolled courses display
   - [ ] Progress shows
   - [ ] Continue learning works

7. **Learning Interface** → http://localhost:3000/learn/1
   - [ ] Video player loads
   - [ ] Lessons sidebar shows
   - [ ] Progress tracked

8. **Profile** → http://localhost:3000/student/profile
   - [ ] Profile info loads
   - [ ] Edit profile works
   - [ ] Avatar upload (UI)

9. **Instructor Dashboard** → http://localhost:3000/instructor
   - [ ] Stats display
   - [ ] Revenue chart shows
   - [ ] Course list loads

10. **Create Course** → http://localhost:3000/instructor/courses/create
    - [ ] Step 1: Basic info
    - [ ] Step 2: Curriculum
    - [ ] Step 3: Media
    - [ ] Step 4: Review

11. **Admin Dashboard** → http://localhost:3000/admin
    - [ ] System stats display
    - [ ] Charts render
    - [ ] Pending approvals show

12. **Chatbot** → Click chat icon (bottom-right)
    - [ ] Widget opens
    - [ ] Send message works
    - [ ] AI response received

---

## 🔍 Backend API Test

### **Test Backend Endpoints:**

```bash
# Get courses (public)
curl http://localhost:8080/api/courses?page=0&size=5

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'

# Get my enrollments (with token)
curl http://localhost:8080/api/enrollments/my-courses \
  -H "Authorization: Bearer YOUR_TOKEN"

# Chatbot health
curl http://localhost:8000/health
```

---

## ✅ Success Checklist

### **Module 1: Authentication**
- [ ] Login works
- [ ] Token saved in localStorage
- [ ] Protected routes require auth

### **Module 2: Courses**
- [ ] Course list loads from backend
- [ ] Filters work
- [ ] Course detail shows

### **Module 3: Contents**
- [ ] Curriculum displays
- [ ] Content types show (Video, Article, etc.)
- [ ] Progress tracked

### **Module 4: Quiz**
- [ ] Quizzes load
- [ ] Start quiz works
- [ ] Submit shows score

### **Module 5: Assignment**
- [ ] Assignments display
- [ ] Submit assignment works
- [ ] Grading displays

### **Module 6: Enrollment**
- [ ] Enroll course works
- [ ] My courses display
- [ ] Progress updates

### **Module 7: Instructor**
- [ ] Instructor dashboard loads
- [ ] Revenue chart displays
- [ ] My courses list

### **Module 8: Statistics**
- [ ] Admin dashboard loads
- [ ] Charts render
- [ ] Stats accurate

### **Module 9: Payment**
- [ ] Transaction list loads
- [ ] Certificate list displays
- [ ] Download works (UI)

### **Chatbot**
- [ ] Widget opens
- [ ] Send message works
- [ ] Response received

---

## 📊 Expected Results

### **All Working:**
```
✅ 1. Authentication
✅ 2. Courses
✅ 3. Contents
✅ 4. Quizzes
✅ 5. Assignments
✅ 6. Enrollments
✅ 7. Instructor
✅ 8. Statistics (if admin)
✅ 9. Payment & Certificate
✅ Chatbot

🎉 9/9 Modules Connected!
```

### **Some Skipped (Normal):**
```
✅ 1. Authentication
✅ 2. Courses
✅ 3. Contents
✅ 4. Quizzes
✅ 5. Assignments
✅ 6. Enrollments
⊘ 7. Instructor (not instructor role)
⊘ 8. Statistics (not admin role)
✅ 9. Payment & Certificate
✅ Chatbot

🎯 7/9 Modules Working (role-based access)
```

---

## 🐛 Troubleshooting

### **If test fails:**

1. **Check Backend Running:**
   ```bash
   curl http://localhost:8080/actuator/health
   ```

2. **Check Chatbot Running:**
   ```bash
   curl http://localhost:8000/health
   ```

3. **Check Token:**
   ```javascript
   console.log('Token:', localStorage.getItem('token'));
   ```

4. **Check CORS:**
   - Backend should allow `http://localhost:3000`
   - Check `application.properties`

5. **Check Database:**
   - MySQL running on port 3306
   - Database `course_management` exists
   - Tables created

---

## 🎯 Quick Verdict

**If you see mostly ✅:**
→ **Integration successful!** 🎉

**If you see ⊘ (skipped):**
→ **Normal** - role-based access working

**If you see ❌:**
→ Check backend/database/CORS settings

---

**Test Time:** ~5 minutes  
**Coverage:** All 9 modules  
**Status:** Ready to verify!

🚀 **Run the test now!**



