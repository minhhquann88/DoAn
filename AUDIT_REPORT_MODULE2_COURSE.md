# 📚 CODEBASE AUDIT REPORT - MODULE 2: COURSE MANAGEMENT

**Date:** 2025-01-22  
**Module:** Course Management (Marketplace Model)  
**Auditor:** AI Code Review System

---

## 📋 EXECUTIVE SUMMARY

Module 2 (Course Management) đã được triển khai với workflow approval-based (không phải self-publish). Phát hiện **1 vấn đề về default status** và **thiếu self-publish flow** theo yêu cầu Marketplace model.

**Current Flow:** Instructor → PENDING_APPROVAL → Admin Approval → PUBLISHED  
**Expected Flow (Marketplace):** Instructor → DRAFT → Self-Publish → PUBLISHED

**Risk Level:** ⚠️ **MEDIUM** (Business Logic Mismatch)

---

## ✅ UC-CRS-01: CREATE COURSE

### **Requirement:** Can an Instructor create a course? What is the default status? (It should be DRAFT)

### **Implementation Status:** ⚠️ **PARTIALLY CORRECT**

**Location:**
- Controller: `backend/src/main/java/com/coursemgmt/controller/CourseController.java`
- Service: `backend/src/main/java/com/coursemgmt/service/CourseService.java`

**Code Analysis:**

```java
// CourseController.java - Line 27-33
@PostMapping
@PreAuthorize("hasRole('ADMIN') or hasRole('LECTURER')")
public ResponseEntity<CourseResponse> createCourse(@Valid @RequestBody CourseRequest request,
                                                 @AuthenticationPrincipal UserDetailsImpl userDetails) {
    Course course = courseService.createCourse(request, userDetails);
    return ResponseEntity.ok(CourseResponse.fromEntity(course));
}

// CourseService.java - Lines 49-80
@Transactional
public Course createCourse(CourseRequest request, UserDetailsImpl userDetails) {
    User instructor = getCurrentUser(userDetails);
    // ... set course fields ...
    
    // Phân quyền: Admin tạo thì PUBLISHED luôn, Giảng viên tạo thì PENDING
    boolean isAdmin = userDetails.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .anyMatch(role -> role.equals(ERole.ROLE_ADMIN.name()));

    if (isAdmin) {
        course.setStatus(ECourseStatus.PUBLISHED);  // Admin → PUBLISHED
    } else {
        // Giảng viên tạo sẽ cần Admin duyệt
        course.setStatus(ECourseStatus.PENDING_APPROVAL);  // ⚠️ NOT DRAFT!
    }

    return courseRepository.save(course);
}
```

**Findings:**
- ✅ **Instructor CAN create courses:** `@PreAuthorize("hasRole('ADMIN') or hasRole('LECTURER')")` allows Instructors
- ✅ **Authorization check:** Proper role-based access control
- ⚠️ **Default Status Issue:** 
  - **Current:** Instructor creates → `PENDING_APPROVAL`
  - **Expected (Marketplace):** Instructor creates → `DRAFT`
- ✅ **Admin behavior:** Admin creates → `PUBLISHED` (correct)

**Status Enum:**
```java
// ECourseStatus.java
public enum ECourseStatus {
    DRAFT,              // ✅ Exists but NOT used for new courses
    PENDING_APPROVAL,   // ⚠️ Currently used for Instructor-created courses
    PUBLISHED           // ✅ Used for approved/published courses
}
```

**Issue:**
- Code sets `PENDING_APPROVAL` instead of `DRAFT` for Instructor-created courses
- This suggests an **approval-based workflow** rather than **self-publish marketplace model**

**Recommendation:**
```java
// CourseService.java - Line 74-77 should be:
} else {
    // Giảng viên tạo sẽ ở trạng thái DRAFT để có thể chỉnh sửa trước khi publish
    course.setStatus(ECourseStatus.DRAFT);  // ✅ Change to DRAFT
}
```

---

## ❌ UC-CRS-03: PUBLISH COURSE

### **Requirement:** Is there an API endpoint that allows the Instructor to change the course status from DRAFT to PUBLISHED without Admin approval?

### **Implementation Status:** ❌ **NOT IMPLEMENTED**

**Location:** `backend/src/main/java/com/coursemgmt/controller/CourseController.java`

**Code Analysis:**

**Available Endpoints:**

1. **POST `/api/courses/{id}/request-approval`** (Lines 88-95)
```java
@PostMapping("/{id}/request-approval")
@PreAuthorize("hasRole('LECTURER') and @courseSecurityService.isInstructor(authentication, #id)")
public ResponseEntity<CourseResponse> requestCourseApproval(@PathVariable Long id,
                                                            @AuthenticationPrincipal UserDetailsImpl userDetails) {
    Course approvedCourse = courseService.requestApproval(id, userDetails);
    return ResponseEntity.ok(CourseResponse.fromEntity(approvedCourse));
}
```

**Service Implementation:**
```java
// CourseService.java - Lines 189-208
public Course requestApproval(Long courseId, UserDetailsImpl userDetails) {
    Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found!"));
    
    // Kiểm tra authorization
    if (!course.getInstructor().getId().equals(userDetails.getId())) {
        throw new RuntimeException("You are not authorized to request approval for this course.");
    }
    
    // Không cho phép nếu đã PUBLISHED
    if (ECourseStatus.PUBLISHED.equals(course.getStatus())) {
        throw new RuntimeException("Course is already published and cannot be sent for re-approval.");
    }
    
    course.setStatus(ECourseStatus.PENDING_APPROVAL);  // ⚠️ Sets to PENDING_APPROVAL, not PUBLISHED
    course.setUpdatedAt(LocalDateTime.now());
    return courseRepository.save(course);
}
```

2. **PATCH `/api/courses/{id}/approve`** (Lines 52-58)
```java
@PatchMapping("/{id}/approve")
@PreAuthorize("hasRole('ADMIN')")  // ⚠️ Only ADMIN can approve
public ResponseEntity<CourseResponse> approveCourse(@PathVariable Long id) {
    Course approvedCourse = courseService.approveCourse(id);
    return ResponseEntity.ok(CourseResponse.fromEntity(approvedCourse));
}
```

**Findings:**
- ❌ **NO Self-Publish Endpoint:** There is NO endpoint that allows Instructor to directly change status from DRAFT → PUBLISHED
- ⚠️ **Request Approval Flow:** Instructor can only request approval (DRAFT → PENDING_APPROVAL)
- ✅ **Admin Approval Required:** Only Admin can approve (PENDING_APPROVAL → PUBLISHED)
- ❌ **Missing:** Endpoint like `POST /api/courses/{id}/publish` for Instructor self-publish

**Current Flow:**
```
Instructor creates → PENDING_APPROVAL → Admin approves → PUBLISHED
```

**Expected Flow (Marketplace):**
```
Instructor creates → DRAFT → Instructor publishes → PUBLISHED
```

**Recommendation:**
Add new endpoint for self-publish:
```java
// CourseController.java - Add new endpoint
@PostMapping("/{id}/publish")
@PreAuthorize("hasRole('LECTURER') and @courseSecurityService.isInstructor(authentication, #id)")
public ResponseEntity<CourseResponse> publishCourse(@PathVariable Long id,
                                                    @AuthenticationPrincipal UserDetailsImpl userDetails) {
    Course publishedCourse = courseService.publishCourse(id, userDetails);
    return ResponseEntity.ok(CourseResponse.fromEntity(publishedCourse));
}

// CourseService.java - Add new method
@Transactional
public Course publishCourse(Long courseId, UserDetailsImpl userDetails) {
    Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found!"));
    
    // Authorization check
    if (!course.getInstructor().getId().equals(userDetails.getId())) {
        throw new RuntimeException("You are not authorized to publish this course.");
    }
    
    // Only allow publish from DRAFT status
    if (course.getStatus() != ECourseStatus.DRAFT) {
        throw new RuntimeException("Only DRAFT courses can be published.");
    }
    
    // Optional: Add validation checks (e.g., course must have at least 1 chapter)
    // if (course.getChapters() == null || course.getChapters().isEmpty()) {
    //     throw new RuntimeException("Course must have at least one chapter before publishing.");
    // }
    
    course.setStatus(ECourseStatus.PUBLISHED);
    course.setUpdatedAt(LocalDateTime.now());
    return courseRepository.save(course);
}
```

---

## ✅ UC-CRS-05: SEARCH COURSES

### **Requirement:** Does the search query filter ensuring only PUBLISHED courses are shown to Students?

### **Implementation Status:** ✅ **CORRECTLY IMPLEMENTED**

**Location:**
- Controller: `backend/src/main/java/com/coursemgmt/controller/CourseController.java`
- Service: `backend/src/main/java/com/coursemgmt/service/CourseService.java`
- Repository: `backend/src/main/java/com/coursemgmt/repository/CourseRepository.java`

**Code Analysis:**

```java
// CourseController.java - Lines 67-78
@GetMapping
public ResponseEntity<Page<CourseResponse>> getAllCourses(
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false) Long categoryId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(defaultValue = "createdAt,desc") String sort
) {
    Page<CourseResponse> courses = courseService.getAllPublishedCourses(keyword, categoryId, page, size, sort);
    return ResponseEntity.ok(courses);
}

// CourseService.java - Lines 149-177
public Page<CourseResponse> getAllPublishedCourses(String keyword, Long categoryId, int page, int size, String sort) {
    // ... pagination setup ...
    
    // 2. Tạo Specification (bộ lọc động)
    Specification<Course> spec = CourseRepository.isPublished();  // ✅ Filters only PUBLISHED
    
    if (keyword != null && !keyword.isEmpty()) {
        spec = spec.and(CourseRepository.titleContains(keyword));
    }
    if (categoryId != null) {
        spec = spec.and(CourseRepository.hasCategory(categoryId));
    }
    
    // 3. Truy vấn
    Page<Course> coursePage = courseRepository.findAll(spec, pageable);
    // ...
}

// CourseRepository.java - Lines 33-36
static Specification<Course> isPublished() {
    return (course, cq, cb) -> cb.equal(course.get("status"), ECourseStatus.PUBLISHED);
}
```

**Findings:**
- ✅ **PUBLISHED Filter:** `CourseRepository.isPublished()` explicitly filters for `ECourseStatus.PUBLISHED`
- ✅ **Applied to Search:** Filter is applied in `getAllPublishedCourses()` method
- ✅ **Public Endpoint:** `GET /api/courses` is public (no authentication required)
- ✅ **Secure:** Students can only see PUBLISHED courses, not DRAFT or PENDING_APPROVAL

**SQL Query Generated:**
```sql
SELECT * FROM courses 
WHERE status = 'PUBLISHED' 
  AND (title LIKE '%keyword%' OR NULL)
  AND (category_id = ? OR NULL)
ORDER BY createdAt DESC
LIMIT 10 OFFSET 0
```

**Verdict:** ✅ **SECURE** - Only PUBLISHED courses are visible to Students.

---

## 🔍 SELF-PUBLISH FLOW ANALYSIS

### **Current Implementation:**

**Workflow:**
```
1. Instructor creates course → Status: PENDING_APPROVAL
2. Instructor calls POST /api/courses/{id}/request-approval → Status: PENDING_APPROVAL (no change)
3. Admin calls PATCH /api/courses/{id}/approve → Status: PUBLISHED
4. Course becomes visible to Students
```

**Issues:**
- ❌ **No DRAFT status usage:** DRAFT enum exists but is never set
- ❌ **No self-publish:** Instructor cannot publish directly
- ⚠️ **Approval-based model:** Requires Admin approval (not marketplace model)

### **Expected Marketplace Model:**

**Workflow:**
```
1. Instructor creates course → Status: DRAFT
2. Instructor edits course (can stay in DRAFT indefinitely)
3. Instructor calls POST /api/courses/{id}/publish → Status: PUBLISHED
4. Course becomes visible to Students immediately
```

**Missing Components:**
- ❌ Default status should be DRAFT (not PENDING_APPROVAL)
- ❌ Self-publish endpoint missing
- ❌ No validation before publish (e.g., course must have content)

---

## 📊 SUMMARY TABLE

| Requirement | Status | Evidence | Issue |
|------------|--------|----------|-------|
| UC-CRS-01: Instructor can create | ✅ YES | Line 28: @PreAuthorize allows LECTURER | - |
| UC-CRS-01: Default status = DRAFT | ❌ NO | Line 76: Sets PENDING_APPROVAL | Should be DRAFT |
| UC-CRS-03: Self-publish endpoint | ❌ NO | No endpoint found | Missing publish endpoint |
| UC-CRS-05: Only PUBLISHED shown | ✅ YES | Line 159: isPublished() filter | - |

---

## 🚨 ISSUES FOUND

### **1. Default Status Mismatch** ⚠️ **MEDIUM**

**Issue:** Instructor-created courses default to `PENDING_APPROVAL` instead of `DRAFT`

**Impact:**
- Courses cannot be saved as drafts for later editing
- Instructor workflow doesn't match marketplace model
- No way to create incomplete courses

**Fix Required:**
```java
// CourseService.java - Line 76
course.setStatus(ECourseStatus.DRAFT);  // Change from PENDING_APPROVAL
```

---

### **2. Missing Self-Publish Endpoint** ⚠️ **HIGH**

**Issue:** No endpoint allows Instructor to publish course directly (DRAFT → PUBLISHED)

**Impact:**
- Marketplace model not supported
- All courses require Admin approval
- Cannot implement self-service course publishing

**Fix Required:**
- Add `POST /api/courses/{id}/publish` endpoint
- Add `publishCourse()` method in CourseService
- Add validation before publish (optional but recommended)

---

### **3. Approval-Based Model vs Marketplace Model** ⚠️ **ARCHITECTURE**

**Issue:** Current implementation uses approval-based workflow, not marketplace self-publish

**Impact:**
- Business logic mismatch with requirements
- Admin bottleneck for course publishing
- Not scalable for marketplace model

**Recommendation:**
- Decide on workflow model: Approval-based OR Self-publish
- If marketplace: Implement self-publish flow
- If approval-based: Keep current implementation but fix default status

---

## 🎯 RECOMMENDATIONS

### **Immediate Actions:**

1. **Fix Default Status**
   - Change `PENDING_APPROVAL` → `DRAFT` in `createCourse()` method
   - Location: `CourseService.java` line 76

2. **Implement Self-Publish Endpoint**
   - Add `POST /api/courses/{id}/publish` endpoint
   - Add `publishCourse()` method in CourseService
   - Add authorization check (only course owner)
   - Add status validation (only DRAFT → PUBLISHED)

3. **Optional: Add Pre-Publish Validation**
   - Check course has at least 1 chapter
   - Check course has description
   - Check course has price set
   - Check course has category

### **Architecture Decision:**

**Question:** Should the system use:
- **Option A:** Approval-based workflow (current) - Admin must approve all courses
- **Option B:** Marketplace self-publish - Instructors can publish directly

**Recommendation:** Based on requirements mentioning "Marketplace model", implement **Option B** with self-publish flow.

---

## 📝 VERDICT

### **Is Self-Publish Flow Implemented Correctly?**

**Answer:** ❌ **NO**

**Justification:**
- ❌ Default status is `PENDING_APPROVAL` (should be `DRAFT`)
- ❌ No self-publish endpoint exists
- ❌ Current flow requires Admin approval
- ✅ Search filter correctly shows only PUBLISHED courses

**Current Model:** Approval-Based Workflow  
**Required Model:** Marketplace Self-Publish Workflow

**Gap:** Missing self-publish functionality and incorrect default status.

---

## 📁 FILES REVIEWED

- ✅ `backend/src/main/java/com/coursemgmt/controller/CourseController.java`
- ✅ `backend/src/main/java/com/coursemgmt/service/CourseService.java`
- ✅ `backend/src/main/java/com/coursemgmt/repository/CourseRepository.java`
- ✅ `backend/src/main/java/com/coursemgmt/model/Course.java`
- ✅ `backend/src/main/java/com/coursemgmt/model/ECourseStatus.java`

---

**Report Generated:** 2025-01-22  
**Next Steps:** Implement self-publish flow and fix default status

