package com.coursemgmt.service;

import com.coursemgmt.dto.CertificateDTO;
import com.coursemgmt.dto.CertificateRequest;
import com.coursemgmt.exception.ResourceNotFoundException;
import com.coursemgmt.model.Certificate;
import com.coursemgmt.model.Enrollment;
import com.coursemgmt.repository.CertificateRepository;
import com.coursemgmt.repository.EnrollmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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
     * Download certificate PDF by ID
     */
    public ResponseEntity<?> downloadCertificateById(Long id) {
        Certificate certificate = certificateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Certificate not found with id: " + id
                ));
        
        return downloadCertificateFile(certificate);
    }

    /**
     * Download certificate PDF by code
     */
    public ResponseEntity<?> downloadCertificateByCode(String code) {
        System.out.println("CertificateService.downloadCertificateByCode: Looking for code: " + code);
        
        Certificate certificate = certificateRepository.findByCertificateCode(code)
                .orElseThrow(() -> {
                    System.err.println("Certificate not found with code: " + code);
                    return new ResourceNotFoundException(
                        "Certificate not found with code: " + code
                    );
                });
        
        System.out.println("CertificateService.downloadCertificateByCode: Found certificate ID: " + certificate.getId());
        System.out.println("CertificateService.downloadCertificateByCode: PDF URL: " + certificate.getPdfUrl());
        
        return downloadCertificateFile(certificate);
    }

    /**
     * Helper method to download certificate PDF file
     */
    private ResponseEntity<?> downloadCertificateFile(Certificate certificate) {
        try {
            System.out.println("========================================");
            System.out.println("downloadCertificateFile: Starting download");
            System.out.println("Certificate ID: " + certificate.getId());
            System.out.println("Certificate Code: " + certificate.getCertificateCode());
            System.out.println("PDF URL from DB: " + certificate.getPdfUrl());
            
            // If PDF URL is null or empty, generate PDF on-the-fly
            if (certificate.getPdfUrl() == null || certificate.getPdfUrl().isEmpty()) {
                System.out.println("PDF URL is null or empty. Generating PDF on-the-fly...");
                try {
                    // Reload certificate with enrollment (eager fetch) to generate PDF
                    Certificate fullCertificate = certificateRepository.findByIdWithEnrollment(certificate.getId())
                            .orElse(certificateRepository.findByCertificateCodeWithEnrollment(certificate.getCertificateCode())
                                    .orElseThrow(() -> new ResourceNotFoundException(
                                        "Certificate not found with id: " + certificate.getId()
                                    )));
                    
                    // Verify enrollment is loaded
                    if (fullCertificate.getEnrollment() == null) {
                        System.err.println("ERROR: Enrollment is null. Cannot generate PDF.");
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body("Certificate data is incomplete. Please contact administrator.");
                    }
                    
                    System.out.println("Generating PDF for certificate: " + fullCertificate.getCertificateCode());
                    System.out.println("Enrollment ID: " + fullCertificate.getEnrollment().getId());
                    
                    // Generate PDF and save
                    String pdfUrl = pdfGeneratorService.generateCertificatePdfAndSave(fullCertificate);
                    fullCertificate.setPdfUrl(pdfUrl);
                    certificateRepository.save(fullCertificate);
                    
                    System.out.println("PDF generated successfully. URL: " + pdfUrl);
                    certificate.setPdfUrl(pdfUrl); // Update local reference
                } catch (Exception e) {
                    System.err.println("ERROR: Failed to generate PDF on-the-fly: " + e.getMessage());
                    e.printStackTrace();
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body("Failed to generate certificate PDF: " + e.getMessage() + ". Please contact administrator.");
                }
            }
            
            // Extract file path from URL
            // Assuming pdfUrl is a file path like: /uploads/certificates/cert-123.pdf
            // or full URL: http://localhost:8080/uploads/certificates/cert-123.pdf
            // or relative path from PdfGeneratorService: http://localhost:8080/certificates/certificate_CERT-XXX.pdf
            String pdfPath = certificate.getPdfUrl();
            System.out.println("Original PDF Path: " + pdfPath);
            
            // If it's a full URL, extract the path
            if (pdfPath.startsWith("http://") || pdfPath.startsWith("https://")) {
                // Extract path from URL
                // Try to find /certificates/ or /uploads/
                int pathStart = pdfPath.indexOf("/certificates/");
                if (pathStart < 0) {
                    pathStart = pdfPath.indexOf("/uploads/");
                }
                if (pathStart > 0) {
                    pdfPath = pdfPath.substring(pathStart);
                    System.out.println("Extracted path from URL: " + pdfPath);
                } else {
                    // If no /certificates/ or /uploads/ found, try to get path after domain
                    int domainEnd = pdfPath.indexOf("/", 8); // Skip http:// or https://
                    if (domainEnd > 0) {
                        pdfPath = pdfPath.substring(domainEnd);
                        System.out.println("Extracted path after domain: " + pdfPath);
                    }
                }
            }
            
            // Convert to file system path
            // PdfGeneratorService saves to ./certificates/ directory
            if (pdfPath.startsWith("/certificates/")) {
                pdfPath = "." + pdfPath; // ./certificates/certificate_CERT-XXX.pdf
            } else if (pdfPath.startsWith("/uploads/certificates/")) {
                pdfPath = "." + pdfPath; // ./uploads/certificates/cert-123.pdf
            } else if (!pdfPath.startsWith("/") && !pdfPath.startsWith("./")) {
                // Relative path, check if it's just filename
                if (pdfPath.contains("certificate_")) {
                    pdfPath = "./certificates/" + pdfPath;
                } else {
                    pdfPath = "./uploads/certificates/" + pdfPath;
                }
            }
            
            System.out.println("Final file path: " + pdfPath);
            
            Path filePath = Paths.get(pdfPath).toAbsolutePath().normalize();
            File file = filePath.toFile();
            
            System.out.println("Absolute file path: " + file.getAbsolutePath());
            System.out.println("File exists: " + file.exists());
            System.out.println("Is file: " + file.isFile());
            
            if (!file.exists() || !file.isFile()) {
                System.err.println("ERROR: File does not exist or is not a file");
                System.err.println("Tried path: " + file.getAbsolutePath());
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Certificate PDF file not found on server. Path: " + file.getAbsolutePath());
            }
            
            Resource resource = new FileSystemResource(file);
            
            // Determine content type
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/pdf";
            }
            
            System.out.println("Content type: " + contentType);
            System.out.println("File size: " + file.length() + " bytes");
            System.out.println("Successfully preparing file for download");
            System.out.println("========================================");
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + file.getName() + "\"")
                    .body(resource);
                    
        } catch (Exception e) {
            System.err.println("========================================");
            System.err.println("ERROR downloading certificate PDF:");
            System.err.println("Message: " + e.getMessage());
            System.err.println("Stack trace:");
            e.printStackTrace();
            System.err.println("========================================");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error downloading certificate: " + e.getMessage());
        }
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
        
        // Set status (default to ACTIVE if not revoked)
        dto.setStatus("ACTIVE");
        
        // completedAt and finalScore not available in Certificate model
        // Can be set from enrollment if needed
        if (certificate.getEnrollment() != null) {
            Enrollment enrollment = certificate.getEnrollment();
            dto.setCompletedAt(enrollment.getEnrolledAt());
            
            // Set finalScore from enrollment progress if available
            if (enrollment.getProgress() != null) {
                dto.setFinalScore((int) Math.round(enrollment.getProgress()));
            }
            
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

