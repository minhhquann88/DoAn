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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/certificates")
public class CertificateController {

    @Autowired
    private CertificateService certificateService;

    // Cấp chứng chỉ mới
    @PostMapping
    public ResponseEntity<CertificateDTO> issueCertificate(
        @Valid @RequestBody CertificateRequest request
    ) {
        CertificateDTO certificate = certificateService.issueCertificate(request);
        return new ResponseEntity<>(certificate, HttpStatus.CREATED);
    }

    // Lấy tất cả certificate (có phân trang)
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

    // Lấy certificate theo ID
    @GetMapping("/{id}")
    public ResponseEntity<CertificateDTO> getCertificateById(@PathVariable Long id) {
        CertificateDTO certificate = certificateService.getCertificateById(id);
        return ResponseEntity.ok(certificate);
    }

    // Download certificate PDF by code
    @GetMapping("/code/{code}/download")
    public ResponseEntity<?> downloadCertificateByCode(@PathVariable String code) {
        return certificateService.downloadCertificateByCode(code);
    }

    // Lấy certificate theo code (để verify)
    @GetMapping("/code/{code}")
    public ResponseEntity<CertificateDTO> getCertificateByCode(@PathVariable String code) {
        CertificateDTO certificate = certificateService.getCertificateByCode(code);
        return ResponseEntity.ok(certificate);
    }

    // Verify certificate
    @GetMapping("/verify/{code}")
    public ResponseEntity<Map<String, Object>> verifyCertificate(@PathVariable String code) {
        boolean isValid = certificateService.verifyCertificate(code);
        return ResponseEntity.ok(Map.of(
            "certificateCode", code,
            "isValid", isValid,
            "message", isValid ? "Certificate is valid" : "Certificate not found"
        ));
    }

    // Lấy tất cả certificate của user
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

    // Download certificate PDF by ID
    @GetMapping("/{id}/download")
    public ResponseEntity<?> downloadCertificateById(@PathVariable Long id) {
        return certificateService.downloadCertificateById(id);
    }

    // Thu hồi certificate (Admin only)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> revokeCertificate(@PathVariable Long id) {
        certificateService.revokeCertificate(id);
        return ResponseEntity.noContent().build();
    }
}

