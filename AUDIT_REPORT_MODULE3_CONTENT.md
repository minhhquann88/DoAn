# 🔍 Audit Report: Module 3 (Content Management)

**Date:** Generated  
**Scope:** Instructor Content Control & Auto-Progress Logic

---

## 1. ✅ INSTRUCTOR CONTENT CONTROL

### 1.1 Can Instructor Add/Edit/Delete Chapters and Lessons?

**Status:** ✅ **CORRECTLY IMPLEMENTED**

**Evidence:**

#### **Create Chapter:**
- **File:** `ContentManagementController.java` (Line 37-42)
- **Authorization:** `@PreAuthorize("hasRole('ADMIN') or @courseSecurityService.isInstructor(authentication, #courseId)")`
- **Endpoint:** `POST /api/manage/content/courses/{courseId}/chapters`
- ✅ Instructor can create chapters for courses they own

#### **Update Chapter:**
- **File:** `ContentManagementController.java` (Line 44-49)
- **Authorization:** `@PreAuthorize("hasRole('ADMIN') or @courseSecurityService.isInstructorOfChapter(authentication, #chapterId)")`
- **Endpoint:** `PUT /api/manage/content/chapters/{chapterId}`
- ✅ Instructor can update chapters they own

#### **Delete Chapter:**
- **File:** `ContentManagementController.java` (Line 51-56)
- **Authorization:** `@PreAuthorize("hasRole('ADMIN') or @courseSecurityService.isInstructorOfChapter(authentication, #chapterId)")`
- **Endpoint:** `DELETE /api/manage/content/chapters/{chapterId}`
- ✅ Instructor can delete chapters they own

#### **Create Lesson:**
- **File:** `ContentManagementController.java` (Line 60-65)
- **Authorization:** `@PreAuthorize("hasRole('ADMIN') or @courseSecurityService.isInstructorOfChapter(authentication, #chapterId)")`
- **Endpoint:** `POST /api/manage/content/chapters/{chapterId}/lessons`
- ✅ Instructor can create lessons in chapters they own

#### **Update Lesson:**
- **File:** `ContentManagementController.java` (Line 67-72)
- **Authorization:** `@PreAuthorize("hasRole('ADMIN') or @courseSecurityService.isInstructorOfLesson(authentication, #lessonId)")`
- **Endpoint:** `PUT /api/manage/content/lessons/{lessonId}`
- ✅ Instructor can update lessons they own

#### **Delete Lesson:**
- **File:** `ContentManagementController.java` (Line 74-79)
- **Authorization:** `@PreAuthorize("hasRole('ADMIN') or @courseSecurityService.isInstructorOfLesson(authentication, #lessonId)")`
- **Endpoint:** `DELETE /api/manage/content/lessons/{lessonId}`
- ✅ Instructor can delete lessons they own

---

### 1.2 Can Instructor Modify Content of Courses They Do NOT Own?

**Status:** ✅ **PROPERLY BLOCKED**

**Security Implementation:**

**File:** `CourseSecurityService.java`

```java
// Line 22-27: Check course ownership
public boolean isInstructor(Authentication authentication, Long courseId) {
    UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
    Course course = courseRepository.findById(courseId).orElse(null);
    if (course == null || course.getInstructor() == null) return false;
    return course.getInstructor().getId().equals(userDetails.getId());
}

// Line 30-37: Check chapter ownership (via course)
public boolean isInstructorOfChapter(Authentication authentication, Long chapterId) {
    UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
    Chapter chapter = chapterRepository.findById(chapterId).orElse(null);
    if (chapter == null) return false;
    return chapter.getCourse().getInstructor().getId().equals(userDetails.getId());
}

// Line 40-46: Check lesson ownership (via chapter -> course)
public boolean isInstructorOfLesson(Authentication authentication, Long lessonId) {
    UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
    Lesson lesson = lessonRepository.findById(lessonId).orElse(null);
    if (lesson == null) return false;
    return lesson.getChapter().getCourse().getInstructor().getId().equals(userDetails.getId());
}
```

**Verification:**
- ✅ All authorization checks verify ownership through the course instructor
- ✅ If Instructor A tries to modify Instructor B's course content, `isInstructor()` returns `false`
- ✅ Spring Security will reject the request with `403 Forbidden`

**Conclusion:** ✅ Instructors CANNOT modify content of courses they do not own.

---

## 2. ⚠️ AUTO-PROGRESS LOGIC (CRITICAL FINDING)

### 2.1 Where is `lesson_progress` Updated?

**Status:** ⚠️ **MANUAL ONLY - NO AUTO-PROGRESS**

**Current Implementation:**

**File:** `ContentService.java` (Line 160-181)

```java
@Transactional
public void markLessonAsCompleted(Long lessonId, UserDetailsImpl userDetails) {
    User user = userRepository.findById(userDetails.getId())
        .orElseThrow(() -> new RuntimeException("User not found!"));
    Lesson lesson = lessonRepository.findById(lessonId)
        .orElseThrow(() -> new RuntimeException("Lesson not found!"));
    Course course = lesson.getChapter().getCourse();

    // Find enrollment
    Enrollment enrollment = enrollmentRepository.findByUserAndCourse(user, course)
        .orElseThrow(() -> new RuntimeException("Bạn chưa đăng ký khóa học này!"));

    // Find or create User_Progress
    User_Progress progress = userProgressRepository.findByEnrollmentAndLesson(enrollment, lesson)
        .orElse(new User_Progress());

    progress.setEnrollment(enrollment);
    progress.setLesson(lesson);
    progress.setIsCompleted(true);  // ⚠️ Manual flag only
    progress.setCompletedAt(LocalDateTime.now());
    userProgressRepository.save(progress);

    // Recalculate course progress
    updateEnrollmentProgress(enrollment);
}
```

**Endpoint:** `POST /api/content/lessons/{lessonId}/complete`  
**File:** `ContentAccessController.java` (Line 33-39)

**Trigger:** Manual API call only (no automatic tracking)

---

### 2.2 Is There Logic Checking "watched_time > 90%" → Mark as COMPLETED?

**Status:** ❌ **NOT IMPLEMENTED**

**Findings:**

1. **User_Progress Model:**
   - **File:** `User_Progress.java` (Line 1-30)
   - **Fields:** Only `isCompleted` (Boolean), `completedAt` (LocalDateTime)
   - ❌ **Missing:** `watchedTime` field
   - ❌ **Missing:** `videoDuration` field
   - ❌ **Missing:** Progress percentage field

2. **No Auto-Progress Logic:**
   - ❌ No endpoint to update watched time
   - ❌ No background job checking video progress
   - ❌ No frontend video player integration tracking progress
   - ❌ No threshold check (90% or any percentage)

3. **Frontend Implementation:**
   - **File:** `frontend/src/app/learn/[id]/page.tsx` (Line 110-112)
   - Only has manual "Complete Lesson" button
   - No video player with `onTimeUpdate` handler
   - No automatic progress tracking

**Conclusion:** ❌ **Auto-progress logic based on watched_time > 90% is MISSING.**

---

### 2.3 Does Marking Lesson as Completed Trigger Course Progress Recalculation?

**Status:** ✅ **CORRECTLY IMPLEMENTED**

**File:** `ContentService.java` (Line 184-206)

```java
private void updateEnrollmentProgress(Enrollment enrollment) {
    long totalLessonsInCourse = lessonRepository.countByChapter_Course_Id(enrollment.getCourse().getId());
    if (totalLessonsInCourse == 0) {
        enrollment.setProgress(100.0);
        enrollment.setStatus(EEnrollmentStatus.COMPLETED);
        enrollmentRepository.save(enrollment);
        return;
    }

    long completedLessons = userProgressRepository.countByEnrollmentAndIsCompleted(enrollment, true);

    double progressPercentage = ((double) completedLessons / totalLessonsInCourse) * 100.0;
    enrollment.setProgress(progressPercentage);

    if (progressPercentage >= 100.0) {
        enrollment.setStatus(EEnrollmentStatus.COMPLETED);
        // (Bạn có thể thêm logic cấp chứng chỉ ở đây)
    } else {
        enrollment.setStatus(EEnrollmentStatus.IN_PROGRESS);
    }

    enrollmentRepository.save(enrollment);
}
```

**Flow:**
1. ✅ `markLessonAsCompleted()` is called (Line 160)
2. ✅ Sets `isCompleted = true` (Line 175)
3. ✅ Calls `updateEnrollmentProgress(enrollment)` (Line 180)
4. ✅ Recalculates: `(completedLessons / totalLessons) * 100` (Line 195)
5. ✅ Updates `enrollment.progress` (Line 196)
6. ✅ Updates `enrollment.status` to `COMPLETED` if 100% (Line 198-202)
7. ✅ Saves to database (Line 205)

**Conclusion:** ✅ Course progress recalculation works correctly.

---

## 📋 SUMMARY

### ✅ Strengths:
1. **Authorization:** Properly implemented with ownership checks
2. **Course Progress Recalculation:** Works correctly when lessons are marked complete
3. **Security:** Instructors cannot modify other instructors' content

### ❌ Critical Missing Features:
1. **Auto-Progress Tracking:** No automatic video progress tracking
2. **Watched Time Field:** `User_Progress` model lacks `watchedTime` field
3. **90% Threshold Logic:** No automatic completion when watched_time > 90%
4. **Video Player Integration:** Frontend has no video progress tracking

---

## 🔧 RECOMMENDATIONS

### High Priority:
1. **Add `watchedTime` field to `User_Progress` model:**
   ```java
   private Integer watchedTimeInSeconds; // Track video watch time
   ```

2. **Create endpoint to update watched time:**
   ```java
   POST /api/content/lessons/{lessonId}/progress
   Body: { "watchedTime": 120, "totalDuration": 150 }
   ```

3. **Implement auto-completion logic:**
   ```java
   if (watchedTime >= totalDuration * 0.9) {
       markLessonAsCompleted(lessonId, userDetails);
   }
   ```

4. **Frontend:** Integrate video player with `onTimeUpdate` to send progress updates

### Medium Priority:
- Add progress percentage field to `User_Progress` for granular tracking
- Implement periodic sync job to check and auto-complete lessons
- Add analytics for video engagement (average watch time, drop-off points)

---

## 📍 SPECIFIC FILE LOCATIONS

| Component | File | Line(s) |
|-----------|------|---------|
| **Mark Lesson Complete** | `ContentService.java` | 160-181 |
| **Recalculate Progress** | `ContentService.java` | 184-206 |
| **Complete Endpoint** | `ContentAccessController.java` | 33-39 |
| **User_Progress Model** | `User_Progress.java` | 1-30 |
| **Security Check (Course)** | `CourseSecurityService.java` | 22-27 |
| **Security Check (Chapter)** | `CourseSecurityService.java` | 30-37 |
| **Security Check (Lesson)** | `CourseSecurityService.java` | 40-46 |

---

**Verdict:** Module 3 has **proper authorization** but **lacks critical auto-progress tracking**. The manual completion flow works, but automatic video progress tracking (watched_time > 90%) is **NOT IMPLEMENTED**.

