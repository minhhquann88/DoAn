# 🔍 Audit Report: Module 6 (Chatbot & Statistics)

**Date:** Generated  
**Scope:** Chatbot System Prompt & API Key Security, Statistics Data Isolation

---

## 1. ⚠️ CHATBOT (Gemini Integration)

### Status: ⚠️ **PARTIALLY SECURE**

### 1.1 System Prompt Check

**File:** `src/core/chatbot.py` (Lines 292-299)

**Evidence:**

```python
def _build_prompt(self, message: str, context: List[Dict], history: List[Dict], user_profile: Dict[str, Any]) -> str:
    """Build prompt for Gemini API"""
    
    prompt = """Bạn là một chatbot AI chuyên nghiệp hỗ trợ học viên trong hệ thống Elearning. Nhiệm vụ của bạn là:

1. Tư vấn và giải đáp về khóa học, giảng viên, nội dung học tập
2. Hướng dẫn sử dụng hệ thống Elearning
3. Hỗ trợ kỹ thuật và xử lý các vấn đề phổ biến
4. Đề xuất lộ trình học phù hợp dựa trên profile học tập của học viên

"""
```

**Verification:**
- ✅ **System prompt exists** (Line 292)
- ✅ **Defines chatbot role:** "chatbot AI chuyên nghiệp hỗ trợ học viên trong hệ thống Elearning"
- ✅ **Defines scope:** Focused on Elearning support (courses, instructors, learning content)
- ✅ **Additional instructions:** Lines 341-347 provide response guidelines
- ⚠️ **Not programming tutor:** Prompt focuses on Elearning, not programming (acceptable for this use case)

**Additional Instructions:**

**File:** `src/core/chatbot.py` (Lines 341-347)

```python
HƯỚNG DẪN TRẢ LỜI:
- Trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp
- Sử dụng thông tin từ ngữ cảnh để đưa ra câu trả lời chính xác
- Nếu không có thông tin trong ngữ cảnh, hãy đề xuất cách tìm hiểu thêm hoặc liên hệ Admin
- Đề xuất các khóa học hoặc tính năng liên quan khi phù hợp
- Nếu cần hỗ trợ kỹ thuật phức tạp, hướng dẫn liên hệ admin qua email hoặc hotline
- Luôn khuyến khích học viên tiếp tục học tập và đạt mục tiêu
```

**Conclusion:** ✅ **System prompt is correctly implemented and focused on Elearning support.**

---

### 1.2 API Key Security

**File:** `src/core/config.py` (Line 11)

**Evidence:**

```python
class Settings(BaseSettings):
    # Gemini Pro API Configuration
    GEMINI_API_KEY: str = "AIzaSyBQBirVN7gyPncGHkYu0BtG9-SyHjNYce8"  # ❌ HARDCODED
    GEMINI_MODEL: str = "gemini-2.0-flash-exp"
    
    # ...
    
    class Config:
        env_file = ".env"  # ✅ Supports .env file
        case_sensitive = True
        extra = "ignore"
```

**Issues Found:**

1. ❌ **API Key is HARDCODED** (Line 11)
   - **Risk:** API key exposed in source code
   - **Impact:** If code is committed to Git, API key is publicly visible
   - **Severity:** **CRITICAL**

2. ⚠️ **Supports .env file** (Line 55)
   - ✅ `env_file = ".env"` allows loading from environment
   - ❌ **BUT:** Hardcoded default value means .env is optional, not required
   - **Risk:** Developers might forget to set .env and use hardcoded key

3. ❌ **No validation**
   - No check to ensure API key is loaded from environment
   - No warning if using hardcoded key

**Usage:**

**File:** `src/core/chatbot.py` (Line 42)

```python
genai.configure(api_key=settings.GEMINI_API_KEY)
```

- Uses `settings.GEMINI_API_KEY` which loads from .env OR uses hardcoded value

**Attack Scenario:**
```
1. Attacker gains access to source code (Git repository leak)
2. Finds hardcoded API key in config.py
3. Uses API key to make unauthorized Gemini API calls
4. Costs accumulate on your account
5. API key can be revoked, causing service disruption
```

**Conclusion:** ❌ **API Key security is CRITICALLY VULNERABLE - hardcoded in source code.**

---

## 2. ❌ STATISTICS (Data Isolation)

### Status: ❌ **DATA LEAK DETECTED**

### 2.1 Instructor Revenue Endpoint

**File:** `StatisticsController.java` (Lines 54-60)

**Endpoint:** `GET /api/v1/statistics/instructor/{instructorId}`

**Evidence:**

```java
@GetMapping("/instructor/{instructorId}")
public ResponseEntity<InstructorStatsDTO> getInstructorStats(
    @PathVariable Long instructorId
) {
    InstructorStatsDTO stats = statisticsService.getInstructorStats(instructorId);
    return ResponseEntity.ok(stats);
}
```

**Issues Found:**

1. ❌ **NO Authorization Check:**
   - Missing `@PreAuthorize` annotation
   - No role-based access control
   - **Anyone can access this endpoint**

2. ❌ **NO Identity Verification:**
   - No check: `currentUserId == instructorId` OR `hasRole('ADMIN')`
   - **Vulnerability:** Any user can view any instructor's revenue by changing `instructorId` parameter

---

### 2.2 Service Layer Analysis

**File:** `StatisticsService.java` (Lines 150-205)

**Evidence:**

```java
public InstructorStatsDTO getInstructorStats(Long instructorId) {
    InstructorStatsDTO stats = new InstructorStatsDTO();
    
    // Basic info
    userRepository.findById(instructorId).ifPresent(user -> {
        stats.setInstructorId(user.getId());
        stats.setInstructorName(user.getFullName());
        stats.setEmail(user.getEmail());
    });
    
    // Courses
    List<Course> courses = courseRepository.findByInstructorId(instructorId);  // ✅ Filters by instructorId
    stats.setTotalCourses((long) courses.size());
    
    // ... 
    
    // Students & Revenue
    Set<Long> uniqueStudents = new HashSet<>();
    double totalRevenue = 0.0;
    
    for (Course course : courses) {  // ✅ Only iterates through instructor's courses
        // Revenue
        List<Transaction> transactions = transactionRepository
            .findByCourseId(course.getId(), Pageable.unpaged())
            .getContent();
        
        totalRevenue += transactions.stream()
            .filter(t -> "SUCCESS".equals(t.getStatus().toString()))
            .mapToDouble(Transaction::getAmount)
            .sum();
    }
    
    stats.setTotalRevenue(totalRevenue);  // ✅ Revenue is correctly filtered by instructor's courses
    return stats;
}
```

**Verification:**

1. ✅ **Service Layer Filtering:**
   - Line 161: `courseRepository.findByInstructorId(instructorId)` - Correctly filters courses by instructor
   - Line 175: `for (Course course : courses)` - Only iterates through instructor's courses
   - Line 188-191: Revenue calculation only includes transactions from instructor's courses
   - **Conclusion:** Service layer correctly filters by `course.instructor.id == instructorId`

2. ❌ **Controller Layer Missing Security:**
   - No authorization check
   - No identity verification
   - **Risk:** Parameter manipulation attack

**Attack Scenario:**

```
1. Instructor A (ID: 1) wants to view their own stats
2. Instructor B (ID: 2) is another instructor
3. Instructor A calls: GET /api/v1/statistics/instructor/2
4. ✅ SUCCESS - Instructor A can see Instructor B's revenue
5. ❌ DATA LEAK: Financial privacy violation
```

**Impact:**
- ❌ Instructors can view other instructors' revenue
- ❌ Financial data privacy violation
- ❌ Competitive intelligence leak
- ❌ GDPR/Data Protection non-compliance

**Conclusion:** ❌ **Service layer correctly filters, but controller lacks authorization - DATA LEAK.**

---

### 2.3 Additional Vulnerable Endpoints

**File:** `StatisticsController.java`

1. **Dashboard Stats (Admin Only?):**
   - `GET /api/v1/statistics/dashboard` (Line 34-38)
   - ❌ **NO authorization check**
   - ❌ **Exposes system-wide statistics** (total revenue, total courses, etc.)
   - **Risk:** Any user can view admin-level statistics

2. **Revenue Report:**
   - `GET /api/v1/statistics/revenue` (Line 78-87)
   - ❌ **NO authorization check**
   - ❌ **Exposes system-wide revenue**
   - **Risk:** Any user can view total revenue

3. **Completion Report:**
   - `GET /api/v1/statistics/completion` (Line 93-97)
   - ❌ **NO authorization check**
   - ❌ **Exposes system-wide completion rates**
   - **Risk:** Any user can view completion statistics

**Secure Endpoint:**
- ✅ `GET /api/v1/statistics/revenue/export` (Line 103-125)
- ✅ Has `@PreAuthorize("hasRole('ADMIN')")` (Line 104)

---

## 📋 SUMMARY

| Component | Status | Risk Level | Evidence |
|-----------|--------|------------|----------|
| **System Prompt** | ✅ IMPLEMENTED | Low | Prompt exists and defines scope (Line 292) |
| **API Key Security** | ❌ VULNERABLE | **CRITICAL** | Hardcoded in config.py (Line 11) |
| **Instructor Revenue Filter** | ✅ CORRECT | Low | Filters by instructorId (Line 161) |
| **Instructor Revenue Authorization** | ❌ MISSING | **CRITICAL** | No @PreAuthorize (Line 54) |
| **Dashboard Stats Authorization** | ❌ MISSING | **HIGH** | No authorization (Line 34) |
| **Revenue Report Authorization** | ❌ MISSING | **HIGH** | No authorization (Line 78) |

---

## 🔧 CRITICAL FIXES REQUIRED

### Fix 1: API Key Security

**File:** `src/core/config.py`

**Current Code (Line 11):**
```python
GEMINI_API_KEY: str = "AIzaSyBQBirVN7gyPncGHkYu0BtG9-SyHjNYce8"  # ❌ HARDCODED
```

**Required Fix:**

1. **Remove hardcoded key:**
```python
GEMINI_API_KEY: str = ""  # Load from environment only
```

2. **Add validation:**
```python
@validator('GEMINI_API_KEY')
def validate_api_key(cls, v):
    if not v or v == "":
        raise ValueError("GEMINI_API_KEY must be set in environment variables or .env file")
    return v
```

3. **Add to .env.example:**
```env
GEMINI_API_KEY=your_api_key_here
```

4. **Add to .gitignore:**
```gitignore
.env
```

---

### Fix 2: Instructor Statistics Authorization

**File:** `StatisticsController.java`

**Add Authorization:**
```java
@GetMapping("/instructor/{instructorId}")
@PreAuthorize("hasRole('ADMIN') or (hasRole('LECTURER') and #instructorId == authentication.principal.id)")
public ResponseEntity<InstructorStatsDTO> getInstructorStats(
    @PathVariable Long instructorId,
    @AuthenticationPrincipal UserDetailsImpl userDetails
) {
    // Only Admin or the instructor themselves can access
    InstructorStatsDTO stats = statisticsService.getInstructorStats(instructorId);
    return ResponseEntity.ok(stats);
}
```

**Service Layer Double-Check (Optional but Recommended):**
```java
public InstructorStatsDTO getInstructorStats(Long instructorId, Long currentUserId, boolean isAdmin) {
    // Verify identity or admin privilege
    if (!isAdmin && !instructorId.equals(currentUserId)) {
        throw new AccessDeniedException("You are not authorized to view this instructor's statistics");
    }
    
    // ... rest of method
}
```

---

### Fix 3: Dashboard & Revenue Report Authorization

**File:** `StatisticsController.java`

**Add Authorization:**
```java
@GetMapping("/dashboard")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
    // Only Admin can access
}

@GetMapping("/revenue")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<RevenueStatsDTO> getRevenueReport(...) {
    // Only Admin can access
}

@GetMapping("/completion")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<CompletionReportDTO> getCompletionReport() {
    // Only Admin can access
}
```

---

## ✅ VERDICT

### **Status: ❌ CRITICAL VULNERABILITIES DETECTED**

**Module 6 is NOT ready for production.**

**Critical Issues:**

1. ❌ **API Key Hardcoded:**
   - Gemini API key exposed in source code
   - **Risk:** Unauthorized API usage, cost accumulation
   - **Severity:** **CRITICAL**

2. ❌ **Financial Data Leak:**
   - Instructors can view other instructors' revenue
   - No authorization on statistics endpoints
   - **Risk:** Privacy violation, competitive intelligence leak
   - **Severity:** **CRITICAL**

3. ❌ **System Statistics Exposed:**
   - Dashboard stats accessible to all users
   - Revenue reports accessible to all users
   - **Risk:** Information disclosure
   - **Severity:** **HIGH**

**What Works:**
- ✅ System prompt correctly defines chatbot scope
- ✅ Service layer correctly filters instructor revenue by instructorId
- ✅ Revenue export endpoint has proper authorization

**Recommendations:**
- 🔴 **URGENT:** Remove hardcoded API key, use environment variables only
- 🔴 **URGENT:** Add authorization to instructor statistics endpoint
- 🔴 **URGENT:** Add authorization to dashboard and revenue report endpoints
- 🟡 **HIGH:** Add service-layer double-checks for defense in depth
- 🟡 **MEDIUM:** Add API key rotation mechanism
- 🟡 **MEDIUM:** Add rate limiting to statistics endpoints

**GDPR/Data Protection Compliance:** ❌ **NON-COMPLIANT**

---

## 📍 SPECIFIC VULNERABLE CODE LOCATIONS

| Vulnerability | File | Line(s) | Severity |
|---------------|------|---------|----------|
| **Hardcoded API Key** | `src/core/config.py` | 11 | **CRITICAL** |
| **Instructor Stats Auth** | `StatisticsController.java` | 54-60 | **CRITICAL** |
| **Dashboard Stats Auth** | `StatisticsController.java` | 34-38 | **HIGH** |
| **Revenue Report Auth** | `StatisticsController.java` | 78-87 | **HIGH** |
| **Completion Report Auth** | `StatisticsController.java` | 93-97 | **HIGH** |

---

**Module 6 Chatbot & Statistics: ❌ NOT PRODUCTION READY - CRITICAL FIXES REQUIRED**

