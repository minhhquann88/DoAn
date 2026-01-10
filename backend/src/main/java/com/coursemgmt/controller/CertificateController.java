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

    // Download certificate PDF by code
    @GetMapping("/code/{code}/download")
    public ResponseEntity<?> downloadCertificateByCode(@PathVariable String code) {
        return certificateService.downloadCertificateByCode(code);
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
}

