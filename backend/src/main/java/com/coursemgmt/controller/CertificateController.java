package com.coursemgmt.controller;

import com.coursemgmt.dto.CertificateDTO;
import com.coursemgmt.dto.CertificateRequest;
import com.coursemgmt.service.CertificateService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/certificates")
public class CertificateController {

    @Autowired
    private CertificateService certificateService;

    /**
     * 1. Cấp chứng chỉ mới
     * POST /api/v1/certificates
     */
    @PostMapping
    public ResponseEntity<CertificateDTO> issueCertificate(
        @Valid @RequestBody CertificateRequest request
    ) {
        CertificateDTO certificate = certificateService.issueCertificate(request);
        return new ResponseEntity<>(certificate, HttpStatus.CREATED);
    }

    /**
     * 2. Lấy tất cả certificate (có phân trang)
     * GET /api/v1/certificates
     */
    @GetMapping
    public ResponseEntity<Page<CertificateDTO>> getAllCertificates(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(defaultValue = "issuedAt") String sortBy,
        @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        Sort.Direction direction = sortDir.equalsIgnoreCase("ASC") 
            ? Sort.Direction.ASC 
            : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        Page<CertificateDTO> certificates = certificateService.getAllCertificates(pageable);
        return ResponseEntity.ok(certificates);
    }

    /**
     * 3. Lấy certificate theo ID
     * GET /api/v1/certificates/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<CertificateDTO> getCertificateById(@PathVariable Long id) {
        CertificateDTO certificate = certificateService.getCertificateById(id);
        return ResponseEntity.ok(certificate);
    }

    /**
     * 4. Lấy certificate theo code (để verify)
     * GET /api/v1/certificates/code/{code}
     */
    @GetMapping("/code/{code}")
    public ResponseEntity<CertificateDTO> getCertificateByCode(@PathVariable String code) {
        CertificateDTO certificate = certificateService.getCertificateByCode(code);
        return ResponseEntity.ok(certificate);
    }

    /**
     * 5. Verify certificate
     * GET /api/v1/certificates/verify/{code}
     */
    @GetMapping("/verify/{code}")
    public ResponseEntity<Map<String, Object>> verifyCertificate(@PathVariable String code) {
        boolean isValid = certificateService.verifyCertificate(code);
        return ResponseEntity.ok(Map.of(
            "certificateCode", code,
            "isValid", isValid,
            "message", isValid ? "Certificate is valid" : "Certificate not found"
        ));
    }

    /**
     * 6. Lấy tất cả certificate của user
     * GET /api/v1/certificates/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<CertificateDTO>> getUserCertificates(
        @PathVariable Long userId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "issuedAt"));
        Page<CertificateDTO> certificates = certificateService.getUserCertificates(userId, pageable);
        return ResponseEntity.ok(certificates);
    }

    /**
     * 7. Lấy certificate của 1 course
     * GET /api/v1/certificates/course/{courseId}
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<Page<CertificateDTO>> getCourseCertificates(
        @PathVariable Long courseId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "issuedAt"));
        Page<CertificateDTO> certificates = certificateService.getCourseCertificates(courseId, pageable);
        return ResponseEntity.ok(certificates);
    }

    /**
     * 8. Thống kê số certificate theo thời gian
     * GET /api/v1/certificates/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getCertificateStats(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        Long count = certificateService.countCertificatesByDateRange(startDate, endDate);
        return ResponseEntity.ok(Map.of(
            "startDate", startDate,
            "endDate", endDate,
            "totalCertificates", count
        ));
    }

    /**
     * 9. Thu hồi certificate (Admin only)
     * DELETE /api/v1/certificates/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> revokeCertificate(@PathVariable Long id) {
        certificateService.revokeCertificate(id);
        return ResponseEntity.noContent().build();
    }
}

