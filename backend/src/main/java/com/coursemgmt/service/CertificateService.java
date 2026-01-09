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

    // Kiểm tra certificate đã tồn tại cho enrollment
    public boolean existsByEnrollmentId(Long enrollmentId) {
        return certificateRepository.existsByEnrollmentId(enrollmentId);
    }
    
    // Tự động cấp chứng chỉ khi hoàn thành khóa học
    @Transactional
    public CertificateDTO issueCertificate(CertificateRequest request) {
        Enrollment enrollment = enrollmentRepository.findById(request.getEnrollmentId())
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Enrollment not found with id: " + request.getEnrollmentId()
                ));
        
        if (enrollment.getProgress() < 100.0) {
            throw new RuntimeException("Cannot issue certificate. Course not completed yet.");
        }
        
        Optional<Certificate> existing = certificateRepository
                .findByEnrollmentId(enrollment.getId());
        if (existing.isPresent()) {
            throw new RuntimeException("Certificate already issued for this enrollment");
        }
        
        Certificate certificate = new Certificate();
        certificate.setEnrollment(enrollment);
        certificate.setCertificateCode(generateCertificateCode());
        certificate.setIssuedAt(LocalDateTime.now());
        
        Certificate saved = certificateRepository.save(certificate);
        
        try {
            String pdfUrl = pdfGeneratorService.generateCertificatePdfAndSave(saved);
            saved.setPdfUrl(pdfUrl);
            certificateRepository.save(saved);
        } catch (Exception e) {
            // Log error but don't fail the certificate issuance
        }
        
        return convertToDTO(saved);
    }

    // Lấy tất cả certificate có phân trang
    public Page<CertificateDTO> getAllCertificates(Pageable pageable) {
        return certificateRepository.findAll(pageable)
                .map(this::convertToDTO);
    }

    // Lấy certificate theo ID
    public CertificateDTO getCertificateById(Long id) {
        Certificate certificate = certificateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Certificate not found with id: " + id
                ));
        return convertToDTO(certificate);
    }

    // Lấy certificate theo code
    public CertificateDTO getCertificateByCode(String code) {
        Certificate certificate = certificateRepository.findByCertificateCode(code)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Certificate not found with code: " + code
                ));
        return convertToDTO(certificate);
    }

    // Lấy tất cả certificate của user
    public Page<CertificateDTO> getUserCertificates(Long userId, Pageable pageable) {
        return certificateRepository.findByEnrollmentUserId(userId, pageable)
                .map(this::convertToDTO);
    }

    // Verify certificate (kiểm tra tính hợp lệ)
    public boolean verifyCertificate(String code) {
        return certificateRepository.findByCertificateCode(code).isPresent();
    }

    // Thu hồi chứng chỉ
    @Transactional
    public void revokeCertificate(Long id) {
        Certificate certificate = certificateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Certificate not found with id: " + id
                ));
        
        certificateRepository.delete(certificate);
    }

    // Download certificate PDF by ID
    public ResponseEntity<?> downloadCertificateById(Long id) {
        Certificate certificate = certificateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Certificate not found with id: " + id
                ));
        
        return downloadCertificateFile(certificate);
    }

    // Download certificate PDF by code
    public ResponseEntity<?> downloadCertificateByCode(String code) {
        Certificate certificate = certificateRepository.findByCertificateCode(code)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Certificate not found with code: " + code
                ));
        
        return downloadCertificateFile(certificate);
    }

    // Helper method to download certificate PDF file
    private ResponseEntity<?> downloadCertificateFile(Certificate certificate) {
        try {
            if (certificate.getPdfUrl() == null || certificate.getPdfUrl().isEmpty()) {
                try {
                    Certificate fullCertificate = certificateRepository.findByIdWithEnrollment(certificate.getId())
                            .orElse(certificateRepository.findByCertificateCodeWithEnrollment(certificate.getCertificateCode())
                                    .orElseThrow(() -> new ResourceNotFoundException(
                                        "Certificate not found with id: " + certificate.getId()
                                    )));
                    
                    if (fullCertificate.getEnrollment() == null) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body("Certificate data is incomplete. Please contact administrator.");
                    }
                    
                    String pdfUrl = pdfGeneratorService.generateCertificatePdfAndSave(fullCertificate);
                    fullCertificate.setPdfUrl(pdfUrl);
                    certificateRepository.save(fullCertificate);
                    certificate.setPdfUrl(pdfUrl);
                } catch (Exception e) {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body("Failed to generate certificate PDF: " + e.getMessage() + ". Please contact administrator.");
                }
            }
            
            String pdfPath = certificate.getPdfUrl();
            
            if (pdfPath.startsWith("http://") || pdfPath.startsWith("https://")) {
                int pathStart = pdfPath.indexOf("/certificates/");
                if (pathStart < 0) {
                    pathStart = pdfPath.indexOf("/uploads/");
                }
                if (pathStart > 0) {
                    pdfPath = pdfPath.substring(pathStart);
                } else {
                    int domainEnd = pdfPath.indexOf("/", 8);
                    if (domainEnd > 0) {
                        pdfPath = pdfPath.substring(domainEnd);
                    }
                }
            }
            
            if (pdfPath.startsWith("/certificates/")) {
                pdfPath = "." + pdfPath;
            } else if (pdfPath.startsWith("/uploads/certificates/")) {
                pdfPath = "." + pdfPath;
            } else if (!pdfPath.startsWith("/") && !pdfPath.startsWith("./")) {
                if (pdfPath.contains("certificate_")) {
                    pdfPath = "./certificates/" + pdfPath;
                } else {
                    pdfPath = "./uploads/certificates/" + pdfPath;
                }
            }
            
            Path filePath = Paths.get(pdfPath).toAbsolutePath().normalize();
            File file = filePath.toFile();
            
            if (!file.exists() || !file.isFile()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Certificate PDF file not found on server. Path: " + file.getAbsolutePath());
            }
            
            Resource resource = new FileSystemResource(file);
            
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/pdf";
            }
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + file.getName() + "\"")
                    .body(resource);
                    
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error downloading certificate: " + e.getMessage());
        }
    }

    // Generate unique certificate code
    private String generateCertificateCode() {
        return "CERT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    // Convert Entity to DTO
    private CertificateDTO convertToDTO(Certificate certificate) {
        CertificateDTO dto = new CertificateDTO();
        dto.setId(certificate.getId());
        dto.setCertificateCode(certificate.getCertificateCode());
        dto.setIssuedAt(certificate.getIssuedAt());
        dto.setPdfUrl(certificate.getPdfUrl());
        dto.setStatus("ACTIVE");
        
        if (certificate.getEnrollment() != null) {
            Enrollment enrollment = certificate.getEnrollment();
            dto.setCompletedAt(enrollment.getEnrolledAt());
            
            if (enrollment.getProgress() != null) {
                dto.setFinalScore((int) Math.round(enrollment.getProgress()));
            }
            
            if (enrollment.getUser() != null) {
                dto.setUserId(enrollment.getUser().getId());
                dto.setUserFullName(enrollment.getUser().getFullName());
                dto.setUserEmail(enrollment.getUser().getEmail());
            }
            
            if (enrollment.getCourse() != null) {
                dto.setCourseId(enrollment.getCourse().getId());
                dto.setCourseTitle(enrollment.getCourse().getTitle());
                
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

