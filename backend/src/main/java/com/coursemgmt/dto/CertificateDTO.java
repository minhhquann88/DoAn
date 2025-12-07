package com.coursemgmt.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CertificateDTO {
    private Long id;
    private String certificateCode; // Mã chứng chỉ duy nhất
    private Long userId;
    private String userFullName;
    private String userEmail;
    private Long courseId;
    private String courseTitle;
    private String instructorName;
    private LocalDateTime issuedAt;
    private LocalDateTime completedAt;
    private String pdfUrl; // URL để download PDF
    private Integer finalScore;
    private String status; // ACTIVE, REVOKED
}

