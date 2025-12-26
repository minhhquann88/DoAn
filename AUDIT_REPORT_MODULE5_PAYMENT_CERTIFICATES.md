# 🔍 Audit Report: Module 5 (Payment & Certificates)

**Date:** Generated  
**Scope:** Payment Flow Automation, Auto-Certificate Issuance, Certificate Integrity

---

## 1. ✅ PAYMENT FLOW (VNPay Integration)

### Status: ✅ **CORRECTLY IMPLEMENTED**

### 1.1 Payment Callback Handler

**File:** `TransactionService.java` (Lines 121-148)

**Endpoint:** `GET /api/v1/transactions/payment/callback`  
**Controller:** `TransactionController.java` (Lines 45-51)

**Evidence:**

```java
@Transactional
public TransactionDTO processPaymentCallback(Map<String, String> params) {
    String txCode = params.get("vnp_TxnRef"); // VNPay transaction ref
    
    Transaction transaction = transactionRepository.findByTransactionCode(txCode)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Transaction not found with code: " + txCode
            ));
    
    // Verify payment từ VNPay
    boolean isValid = vnPayService.verifyPaymentSignature(params);
    String responseCode = params.get("vnp_ResponseCode");
    
    if (isValid && "00".equals(responseCode)) {
        // Payment success
        transaction.setStatus(ETransactionStatus.SUCCESS);
        
        // Tự động tạo enrollment khi thanh toán thành công
        createEnrollmentAfterPayment(transaction);
    } else {
        // Payment failed
        transaction.setStatus(ETransactionStatus.FAILED);
    }
    
    Transaction updated = transactionRepository.save(transaction);
    return convertToDTO(updated);
}
```

**Verification:**
- ✅ **Checks `vnp_ResponseCode == "00"`** (Line 134) - VNPay success code
- ✅ **Verifies payment signature** (Line 131) - Security check
- ✅ **Sets transaction status to SUCCESS** (Line 136)
- ✅ **Calls `createEnrollmentAfterPayment()`** (Line 140) - Automatic enrollment creation

---

### 1.2 Automatic Enrollment Creation

**File:** `TransactionService.java` (Lines 150-162)

**Evidence:**

```java
private void createEnrollmentAfterPayment(Transaction transaction) {
    Enrollment enrollment = new Enrollment();
    enrollment.setUser(transaction.getUser());
    enrollment.setCourse(transaction.getCourse());
    enrollment.setEnrolledAt(LocalDateTime.now());
    enrollment.setProgress(0.0);
    enrollment.setStatus(EEnrollmentStatus.IN_PROGRESS);
    
    enrollmentRepository.save(enrollment);
}
```

**Verification:**
- ✅ **Automatically creates Enrollment** when payment succeeds
- ✅ **Sets status to `IN_PROGRESS`** (Line 159) - Correct status (not PENDING)
- ✅ **Sets progress to 0.0** (Line 158) - Initial progress
- ✅ **Sets enrolledAt timestamp** (Line 157)

**Note:** `EEnrollmentStatus` enum only has `IN_PROGRESS` and `COMPLETED` (no `ACTIVE` or `PENDING`). The status `IN_PROGRESS` is correct and means the enrollment is active.

**Conclusion:** ✅ **Payment flow correctly activates enrollment automatically.**

---

## 2. ❌ AUTO-CERTIFICATE ISSUANCE

### Status: ❌ **NOT IMPLEMENTED**

### 2.1 Certificate Service Method

**File:** `CertificateService.java` (Lines 35-76)

**Evidence:**

```java
@Transactional
public CertificateDTO issueCertificate(CertificateRequest request) {
    // Validate enrollment
    Enrollment enrollment = enrollmentRepository.findById(request.getEnrollmentId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Enrollment not found with id: " + request.getEnrollmentId()
            ));
    
    // Check if enrollment is completed
    if (enrollment.getProgress() < 100.0) {
        throw new RuntimeException("Cannot issue certificate. Course not completed yet.");
    }
    
    // Check if certificate already exists
    Optional<Certificate> existing = certificateRepository
            .findByEnrollmentId(enrollment.getId());
    if (existing.isPresent()) {
        throw new RuntimeException("Certificate already issued for this enrollment");
    }
    
    // Create certificate
    Certificate certificate = new Certificate();
    certificate.setEnrollment(enrollment);
    certificate.setCertificateCode(generateCertificateCode());
    certificate.setIssuedAt(LocalDateTime.now());
    
    Certificate saved = certificateRepository.save(certificate);
    
    // Generate PDF asynchronously
    try {
        String pdfUrl = pdfGeneratorService.generateCertificatePdfAndSave(saved);
        saved.setPdfUrl(pdfUrl);
        certificateRepository.save(saved);
    } catch (Exception e) {
        System.err.println("Failed to generate PDF: " + e.getMessage());
    }
    
    return convertToDTO(saved);
}
```

**Verification:**
- ✅ **Method `issueCertificate()` exists** (Line 36)
- ✅ **Checks if enrollment progress >= 100%** (Line 44)
- ✅ **Prevents duplicate certificates** (Lines 49-53)
- ✅ **Generates certificate code** (Line 58)
- ✅ **Generates PDF** (Lines 67-69)

---

### 2.2 Missing Auto-Trigger

**File:** `ContentService.java` (Lines 226-248)

**Evidence:**

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
        // (Bạn có thể thêm logic cấp chứng chỉ ở đây)  ❌ COMMENT ONLY - NOT IMPLEMENTED
    } else {
        enrollment.setStatus(EEnrollmentStatus.IN_PROGRESS);
    }

    enrollmentRepository.save(enrollment);
}
```

**Issues Found:**
- ❌ **Comment suggests certificate issuance** (Line 242) - "Bạn có thể thêm logic cấp chứng chỉ ở đây"
- ❌ **No actual call to `issueCertificate()`** - Missing implementation
- ❌ **No injection of `CertificateService`** - Service not available in ContentService

**Impact:**
- ❌ Certificates are NOT automatically issued when course is completed
- ❌ Users must manually request certificates (if endpoint exists)
- ❌ Breaks end-to-end automation: Pay → Study → Get Certificate

**Conclusion:** ❌ **Auto-certificate issuance is NOT implemented.**

---

## 3. ✅ CERTIFICATE INTEGRITY

### Status: ✅ **CORRECTLY IMPLEMENTED**

### 3.1 Unique Certificate Code

**File:** `CertificateService.java` (Lines 162-164)

**Evidence:**

```java
private String generateCertificateCode() {
    return "CERT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
}
```

**Verification:**
- ✅ **Uses UUID** - `UUID.randomUUID()` ensures uniqueness
- ✅ **Format:** `CERT-XXXXXXXX` (8 characters from UUID)
- ✅ **Uppercase** - Consistent format
- ✅ **Stored in database** - `certificateCode` field is unique (Line 16 in Certificate.java)

**Certificate Model:**

**File:** `Certificate.java` (Lines 16-17)

```java
@Column(unique = true, nullable = false)
private String certificateCode; // Mã chứng chỉ
```

- ✅ **Database constraint:** `unique = true` ensures no duplicates
- ✅ **Not nullable:** `nullable = false` ensures every certificate has a code

---

### 3.2 PDF Generation

**File:** `PdfGeneratorService.java` (Lines 34-89)

**Evidence:**

```java
public byte[] generateCertificatePdf(Certificate certificate) throws IOException {
    // Generate HTML content
    String htmlContent = generateCertificateHtmlContent(certificate);
    
    // Convert HTML to PDF using OpenHTMLToPDF
    return convertHtmlToPdf(htmlContent);
}

private byte[] convertHtmlToPdf(String htmlContent) throws IOException {
    try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
        PdfRendererBuilder builder = new PdfRendererBuilder();
        builder.withHtmlContent(htmlContent, null);
        builder.toStream(outputStream);
        builder.run();
        
        return outputStream.toByteArray();
    }
}

public String generateCertificatePdfAndSave(Certificate certificate) throws IOException {
    // Ensure storage directory exists
    File directory = new File(storagePath);
    if (!directory.exists()) {
        directory.mkdirs();
    }
    
    String filename = "certificate_" + certificate.getCertificateCode() + ".pdf";
    String filepath = storagePath + File.separator + filename;
    
    // Generate PDF bytes
    byte[] pdfBytes = generateCertificatePdf(certificate);
    
    // Save PDF to file
    try (FileOutputStream fos = new FileOutputStream(filepath)) {
        fos.write(pdfBytes);
        fos.flush();
    }
    
    return baseUrl + "/" + filename;
}
```

**Verification:**
- ✅ **Uses OpenHTMLToPDF** - `PdfRendererBuilder` from `com.openhtmltopdf.pdfboxout`
- ✅ **HTML to PDF conversion** - Generates HTML content, then converts to PDF
- ✅ **Saves to file system** - Stores PDF in configured directory
- ✅ **Returns URL** - Provides downloadable link
- ✅ **Certificate content includes:**
  - User name
  - Course title
  - Instructor name
  - Issue date
  - Certificate code

**PDF Content:**

**File:** `PdfGeneratorService.java` (Lines 95-195)

- ✅ **Professional design** - Gradient background, styled certificate
- ✅ **Bilingual** - Vietnamese and English
- ✅ **Contains certificate code** - For verification
- ✅ **A4 Landscape format** - Standard certificate size

**Conclusion:** ✅ **Certificate integrity is correctly implemented with unique codes and PDF generation.**

---

## 📋 SUMMARY

| Component | Status | Evidence |
|-----------|--------|----------|
| **Payment Success → Enrollment** | ✅ IMPLEMENTED | `createEnrollmentAfterPayment()` called automatically |
| **Enrollment Status** | ✅ CORRECT | `IN_PROGRESS` (active enrollment) |
| **Certificate Service Method** | ✅ EXISTS | `issueCertificate()` method present |
| **Auto-Certificate Trigger** | ❌ MISSING | Comment only, no implementation |
| **Certificate Code (UUID)** | ✅ IMPLEMENTED | Unique code generation |
| **PDF Generation** | ✅ IMPLEMENTED | OpenHTMLToPDF integration |

---

## 🔧 CRITICAL FIX REQUIRED

### Missing: Auto-Certificate Issuance

**File:** `ContentService.java`

**Current Code (Line 240-242):**
```java
if (progressPercentage >= 100.0) {
    enrollment.setStatus(EEnrollmentStatus.COMPLETED);
    // (Bạn có thể thêm logic cấp chứng chỉ ở đây)  ❌ NOT IMPLEMENTED
}
```

**Required Fix:**

1. **Inject CertificateService:**
```java
@Autowired
private CertificateService certificateService;
```

2. **Add Auto-Certificate Logic:**
```java
if (progressPercentage >= 100.0) {
    enrollment.setStatus(EEnrollmentStatus.COMPLETED);
    enrollmentRepository.save(enrollment);
    
    // Auto-issue certificate when course is completed
    try {
        CertificateRequest certRequest = new CertificateRequest();
        certRequest.setEnrollmentId(enrollment.getId());
        certificateService.issueCertificate(certRequest);
    } catch (Exception e) {
        // Log error but don't fail enrollment update
        System.err.println("Failed to auto-issue certificate: " + e.getMessage());
    }
} else {
    enrollment.setStatus(EEnrollmentStatus.IN_PROGRESS);
}
```

---

## ✅ VERDICT

### **Status: ⚠️ PARTIALLY IMPLEMENTED**

**Payment Flow:** ✅ **CORRECTLY IMPLEMENTED**
- Payment success automatically creates enrollment
- Enrollment status is correctly set to `IN_PROGRESS` (active)

**Certificate Integrity:** ✅ **CORRECTLY IMPLEMENTED**
- Unique certificate codes using UUID
- PDF generation with OpenHTMLToPDF
- Professional certificate design

**Auto-Certificate Issuance:** ❌ **NOT IMPLEMENTED**
- Certificate service method exists but is not automatically triggered
- End-to-end automation is broken: Pay → Study 100% → ❌ No Certificate

**End-to-End Flow Status:**
```
✅ Pay → ✅ Active Course → ✅ Study 100% → ❌ Get Certificate (MANUAL ONLY)
```

**Recommendation:**
- 🔴 **URGENT:** Implement auto-certificate issuance in `ContentService.updateEnrollmentProgress()`
- 🟡 **HIGH:** Add error handling and logging for certificate generation failures
- 🟡 **MEDIUM:** Consider async certificate generation to avoid blocking enrollment updates

**Module 5 Payment & Certificates: ⚠️ PARTIALLY READY - AUTO-CERTIFICATE MISSING**

---

## 📍 SPECIFIC CODE LOCATIONS

| Component | File | Line(s) |
|-----------|------|---------|
| **Payment Callback** | `TransactionService.java` | 121-148 |
| **Auto Enrollment** | `TransactionService.java` | 150-162 |
| **Certificate Service** | `CertificateService.java` | 35-76 |
| **Certificate Code** | `CertificateService.java` | 162-164 |
| **PDF Generation** | `PdfGeneratorService.java` | 34-89 |
| **Progress Update** | `ContentService.java` | 226-248 |
| **Missing Auto-Cert** | `ContentService.java` | 242 (comment only) |

---

**Module 5 Payment & Certificates: ⚠️ PARTIALLY PRODUCTION READY - AUTO-CERTIFICATE ISSUANCE REQUIRED**

