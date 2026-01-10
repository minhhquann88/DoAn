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

// Service quản lý chứng chỉ (Certificate)
// - Cấp phát chứng chỉ khi học viên hoàn thành khóa học (progress = 100%)
// - Tạo và lưu file PDF chứng chỉ vào server
// - Tải xuống chứng chỉ theo mã code duy nhất
@Service
public class CertificateService {

    @Autowired
    private CertificateRepository certificateRepository; // Repository để truy vấn bảng certificates trong database
    
    @Autowired
    private EnrollmentRepository enrollmentRepository; // Repository để lấy thông tin đăng ký khóa học (enrollments)
    
    @Autowired
    private PdfGeneratorService pdfGeneratorService; // Service để tạo file PDF chứng chỉ từ HTML template

    // Kiểm tra xem đã có chứng chỉ cho enrollment này chưa
    // Dùng để tránh cấp chứng chỉ trùng lặp
    public boolean existsByEnrollmentId(Long enrollmentId) {
        return certificateRepository.existsByEnrollmentId(enrollmentId);
    }
    
    // Tự động cấp chứng chỉ khi học viên hoàn thành khóa học (progress = 100%)
    // Quy trình:
    // 1. Kiểm tra enrollment có tồn tại không
    // 2. Kiểm tra progress đã đạt 100% chưa
    // 3. Kiểm tra chứng chỉ đã được cấp chưa (tránh cấp trùng)
    // 4. Tạo chứng chỉ mới với mã code duy nhất
    // 5. Tạo file PDF và lưu vào server
    @Transactional
    public CertificateDTO issueCertificate(CertificateRequest request) {
        // Bước 1: Tìm enrollment theo ID
        Enrollment enrollment = enrollmentRepository.findById(request.getEnrollmentId())
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Enrollment not found with id: " + request.getEnrollmentId()
                ));
        
        // Bước 2: Kiểm tra học viên đã hoàn thành khóa học chưa (progress phải = 100%)
        if (enrollment.getProgress() < 100.0) {
            throw new RuntimeException("Cannot issue certificate. Course not completed yet.");
        }
        
        // Bước 3: Kiểm tra chứng chỉ đã được cấp cho enrollment này chưa (tránh cấp trùng)
        Optional<Certificate> existing = certificateRepository
                .findByEnrollmentId(enrollment.getId());
        if (existing.isPresent()) {
            throw new RuntimeException("Certificate already issued for this enrollment");
        }
        
        // Bước 4: Tạo chứng chỉ mới
        Certificate certificate = new Certificate();
        certificate.setEnrollment(enrollment); // Liên kết với enrollment
        certificate.setCertificateCode(generateCertificateCode()); // Tạo mã code duy nhất (VD: CERT-ABC12345)
        certificate.setIssuedAt(LocalDateTime.now()); // Thời gian cấp chứng chỉ
        
        // Bước 5: Lưu chứng chỉ vào database
        Certificate saved = certificateRepository.save(certificate);
        
        // Bước 6: Tạo file PDF chứng chỉ (nếu lỗi thì vẫn cấp chứng chỉ, chỉ log lỗi)
        try {
            String pdfUrl = pdfGeneratorService.generateCertificatePdfAndSave(saved);
            saved.setPdfUrl(pdfUrl); // Lưu đường dẫn file PDF
            certificateRepository.save(saved); // Cập nhật lại chứng chỉ với PDF URL
        } catch (Exception e) {
            // Nếu tạo PDF lỗi, vẫn cấp chứng chỉ (chỉ log lỗi, không throw exception)
            // Có thể tạo lại PDF sau khi download
        }
        
        return convertToDTO(saved);
    }

    // Lấy danh sách tất cả chứng chỉ của một user (có phân trang)
    // Tìm tất cả chứng chỉ thông qua enrollment của user đó
    public Page<CertificateDTO> getUserCertificates(Long userId, Pageable pageable) {
        return certificateRepository.findByEnrollmentUserId(userId, pageable)
                .map(this::convertToDTO); // Convert từ Entity sang DTO
    }

    // Tải xuống file PDF chứng chỉ theo mã code
    // Tìm chứng chỉ theo code và trả về file PDF để download
    public ResponseEntity<?> downloadCertificateByCode(String code) {
        // Tìm chứng chỉ theo mã code
        Certificate certificate = certificateRepository.findByCertificateCode(code)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Certificate not found with code: " + code
                ));
        
        // Gọi method helper để xử lý download file
        return downloadCertificateFile(certificate);
    }

    // Helper method: Xử lý tải xuống file PDF chứng chỉ
    // Logic:
    // 1. Nếu chưa có PDF URL → Tạo lại file PDF
    // 2. Xử lý đường dẫn file (có thể là URL đầy đủ hoặc đường dẫn tương đối)
    // 3. Kiểm tra file có tồn tại trên server không
    // 4. Trả về file PDF để download
    private ResponseEntity<?> downloadCertificateFile(Certificate certificate) {
        try {
            // Bước 1: Kiểm tra xem đã có file PDF chưa
            // Nếu chưa có → Tạo lại file PDF từ dữ liệu enrollment
            if (certificate.getPdfUrl() == null || certificate.getPdfUrl().isEmpty()) {
                try {
                    // Lấy đầy đủ thông tin certificate kèm enrollment (cần để tạo PDF)
                    Certificate fullCertificate = certificateRepository.findByIdWithEnrollment(certificate.getId())
                            .orElse(certificateRepository.findByCertificateCodeWithEnrollment(certificate.getCertificateCode())
                                    .orElseThrow(() -> new ResourceNotFoundException(
                                        "Certificate not found with id: " + certificate.getId()
                                    )));
                    
                    // Kiểm tra dữ liệu enrollment có đầy đủ không
                    if (fullCertificate.getEnrollment() == null) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body("Certificate data is incomplete. Please contact administrator.");
                    }
                    
                    // Tạo lại file PDF và lưu vào server
                    String pdfUrl = pdfGeneratorService.generateCertificatePdfAndSave(fullCertificate);
                    fullCertificate.setPdfUrl(pdfUrl);
                    certificateRepository.save(fullCertificate);
                    certificate.setPdfUrl(pdfUrl); // Cập nhật URL cho certificate hiện tại
                } catch (Exception e) {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body("Failed to generate certificate PDF: " + e.getMessage() + ". Please contact administrator.");
                }
            }
            
            // Bước 2: Xử lý đường dẫn file PDF
            // pdfUrl có thể là:
            // - URL đầy đủ: http://domain.com/certificates/file.pdf
            // - Đường dẫn tuyệt đối: /certificates/file.pdf
            // - Đường dẫn tương đối: certificates/file.pdf
            String pdfPath = certificate.getPdfUrl();
            
            // Nếu là URL đầy đủ (http/https) → Trích xuất phần đường dẫn
            if (pdfPath.startsWith("http://") || pdfPath.startsWith("https://")) {
                // Tìm vị trí bắt đầu của đường dẫn (sau domain)
                int pathStart = pdfPath.indexOf("/certificates/");
                if (pathStart < 0) {
                    pathStart = pdfPath.indexOf("/uploads/");
                }
                if (pathStart > 0) {
                    // Lấy phần đường dẫn từ sau domain
                    pdfPath = pdfPath.substring(pathStart);
                } else {
                    // Nếu không tìm thấy /certificates/ hoặc /uploads/ → Lấy từ sau domain
                    int domainEnd = pdfPath.indexOf("/", 8); // Bỏ qua "http://" hoặc "https://"
                    if (domainEnd > 0) {
                        pdfPath = pdfPath.substring(domainEnd);
                    }
                }
            }
            
            // Bước 3: Chuẩn hóa đường dẫn thành đường dẫn tương đối từ thư mục gốc project
            // Thêm "." ở đầu để biểu thị thư mục hiện tại (thư mục gốc project)
            if (pdfPath.startsWith("/certificates/")) {
                pdfPath = "." + pdfPath; // ./certificates/file.pdf
            } else if (pdfPath.startsWith("/uploads/certificates/")) {
                pdfPath = "." + pdfPath; // ./uploads/certificates/file.pdf
            } else if (!pdfPath.startsWith("/") && !pdfPath.startsWith("./")) {
                // Nếu là tên file đơn → Thêm đường dẫn thư mục
                if (pdfPath.contains("certificate_")) {
                    pdfPath = "./certificates/" + pdfPath;
                } else {
                    pdfPath = "./uploads/certificates/" + pdfPath;
                }
            }
            
            // Bước 4: Chuyển đổi đường dẫn thành File object và kiểm tra file có tồn tại không
            Path filePath = Paths.get(pdfPath).toAbsolutePath().normalize(); // Chuẩn hóa đường dẫn
            File file = filePath.toFile();
            
            // Kiểm tra file có tồn tại và là file (không phải thư mục) không
            if (!file.exists() || !file.isFile()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Certificate PDF file not found on server. Path: " + file.getAbsolutePath());
            }
            
            // Bước 5: Tạo Resource từ file và trả về để download
            Resource resource = new FileSystemResource(file);
            
            // Xác định content type (mặc định là application/pdf)
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/pdf";
            }
            
            // Trả về file PDF với header để browser tự động download
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + file.getName() + "\"") // Tên file khi download
                    .body(resource);
                    
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error downloading certificate: " + e.getMessage());
        }
    }

    // Tạo mã code duy nhất cho chứng chỉ
    // Format: CERT-XXXXXXXX (8 ký tự ngẫu nhiên từ UUID)
    // VD: CERT-A1B2C3D4
    private String generateCertificateCode() {
        return "CERT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    // Chuyển đổi Certificate Entity sang CertificateDTO
    // DTO chỉ chứa thông tin cần thiết để trả về cho client (không có thông tin nhạy cảm)
    private CertificateDTO convertToDTO(Certificate certificate) {
        CertificateDTO dto = new CertificateDTO();
        
        // Thông tin cơ bản của chứng chỉ
        dto.setId(certificate.getId());
        dto.setCertificateCode(certificate.getCertificateCode()); // Mã code duy nhất
        dto.setIssuedAt(certificate.getIssuedAt()); // Thời gian cấp chứng chỉ
        dto.setPdfUrl(certificate.getPdfUrl()); // Đường dẫn file PDF
        dto.setStatus("ACTIVE"); // Trạng thái chứng chỉ
        
        // Lấy thông tin từ enrollment (nếu có)
        if (certificate.getEnrollment() != null) {
            Enrollment enrollment = certificate.getEnrollment();
            
            // Thời gian hoàn thành khóa học (lấy từ thời gian đăng ký)
            dto.setCompletedAt(enrollment.getEnrolledAt());
            
            // Điểm số cuối cùng (làm tròn từ progress)
            if (enrollment.getProgress() != null) {
                dto.setFinalScore((int) Math.round(enrollment.getProgress()));
            }
            
            // Thông tin học viên
            if (enrollment.getUser() != null) {
                dto.setUserId(enrollment.getUser().getId());
                dto.setUserFullName(enrollment.getUser().getFullName());
                dto.setUserEmail(enrollment.getUser().getEmail());
            }
            
            // Thông tin khóa học
            if (enrollment.getCourse() != null) {
                dto.setCourseId(enrollment.getCourse().getId());
                dto.setCourseTitle(enrollment.getCourse().getTitle());
                
                // Thông tin giảng viên
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

