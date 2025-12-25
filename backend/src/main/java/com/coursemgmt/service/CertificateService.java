package com.coursemgmt.service;

import com.coursemgmt.dto.CertificateDTO;
import com.coursemgmt.dto.CertificateRequest;
import com.coursemgmt.exception.ResourceNotFoundException;
import com.coursemgmt.model.Certificate;
import com.coursemgmt.model.Enrollment;
import com.coursemgmt.repository.CertificateRepository;
import com.coursemgmt.repository.EnrollmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class CertificateService {

    @Autowired
    private CertificateRepository certificateRepository;
    
    @Autowired
    private EnrollmentRepository enrollmentRepository;
    
    @Autowired
    private PdfGeneratorService pdfGeneratorService; // Service để generate PDF

    /**
     * Tự động cấp chứng chỉ khi hoàn thành khóa học
     */
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
        // Note: completedAt and finalScore are not in Certificate model
        // They can be derived from enrollment if needed
        
        Certificate saved = certificateRepository.save(certificate);
        
        // Generate PDF asynchronously
        try {
            String pdfUrl = pdfGeneratorService.generateCertificatePdfAndSave(saved);
            saved.setPdfUrl(pdfUrl);
            certificateRepository.save(saved);
        } catch (Exception e) {
            // Log error but don't fail the certificate issuance
            System.err.println("Failed to generate PDF: " + e.getMessage());
        }
        
        return convertToDTO(saved);
    }

    /**
     * Lấy tất cả certificate có phân trang
     */
    public Page<CertificateDTO> getAllCertificates(Pageable pageable) {
        return certificateRepository.findAll(pageable)
                .map(this::convertToDTO);
    }

    /**
     * Lấy certificate theo ID
     */
    public CertificateDTO getCertificateById(Long id) {
        Certificate certificate = certificateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Certificate not found with id: " + id
                ));
        return convertToDTO(certificate);
    }

    /**
     * Lấy certificate theo code
     */
    public CertificateDTO getCertificateByCode(String code) {
        Certificate certificate = certificateRepository.findByCertificateCode(code)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Certificate not found with code: " + code
                ));
        return convertToDTO(certificate);
    }

    /**
     * Lấy tất cả certificate của user
     */
    public Page<CertificateDTO> getUserCertificates(Long userId, Pageable pageable) {
        return certificateRepository.findByEnrollmentUserId(userId, pageable)
                .map(this::convertToDTO);
    }

    /**
     * Lấy certificate của 1 course
     */
    public Page<CertificateDTO> getCourseCertificates(Long courseId, Pageable pageable) {
        return certificateRepository.findByEnrollmentCourseId(courseId, pageable)
                .map(this::convertToDTO);
    }

    /**
     * Verify certificate (kiểm tra tính hợp lệ)
     */
    public boolean verifyCertificate(String code) {
        return certificateRepository.findByCertificateCode(code).isPresent();
    }

    /**
     * Thống kê số certificate đã cấp theo khoảng thời gian
     */
    public Long countCertificatesByDateRange(
        LocalDateTime startDate, 
        LocalDateTime endDate
    ) {
        return certificateRepository.countCertificatesByDateRange(startDate, endDate);
    }

    /**
     * Revoke certificate (Thu hồi chứng chỉ)
     */
    @Transactional
    public void revokeCertificate(Long id) {
        Certificate certificate = certificateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Certificate not found with id: " + id
                ));
        
        // Có thể thêm field status trong Certificate model
        // certificate.setStatus("REVOKED");
        // certificateRepository.save(certificate);
        
        // Hoặc xóa luôn
        certificateRepository.delete(certificate);
    }

    /**
     * Generate unique certificate code
     */
    private String generateCertificateCode() {
        return "CERT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    /**
     * Convert Entity to DTO
     */
    private CertificateDTO convertToDTO(Certificate certificate) {
        CertificateDTO dto = new CertificateDTO();
        dto.setId(certificate.getId());
        dto.setCertificateCode(certificate.getCertificateCode());
        dto.setIssuedAt(certificate.getIssuedAt());
        dto.setPdfUrl(certificate.getPdfUrl());
        // completedAt and finalScore not available in Certificate model
        // Can be set from enrollment if needed
        if (certificate.getEnrollment() != null) {
            dto.setCompletedAt(certificate.getEnrollment().getEnrolledAt());
        }
        
        // Enrollment info
        if (certificate.getEnrollment() != null) {
            Enrollment enrollment = certificate.getEnrollment();
            
            // User info
            if (enrollment.getUser() != null) {
                dto.setUserId(enrollment.getUser().getId());
                dto.setUserFullName(enrollment.getUser().getFullName());
                dto.setUserEmail(enrollment.getUser().getEmail());
            }
            
            // Course info
            if (enrollment.getCourse() != null) {
                dto.setCourseId(enrollment.getCourse().getId());
                dto.setCourseTitle(enrollment.getCourse().getTitle());
                
                // Instructor info
                if (enrollment.getCourse().getInstructor() != null) {
                    dto.setInstructorName(
                        enrollment.getCourse().getInstructor().getFullName()
                    );
                }
            }
        }
        
        return dto;
    }
}

