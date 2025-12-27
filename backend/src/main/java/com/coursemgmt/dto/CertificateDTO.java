package com.coursemgmt.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CertificateDTO {
    private Long id;
    private String certificateCode; // Mã chứng chỉ duy nhất
    private Long userId;
    
    @JsonProperty("userName")
    private String userFullName; // Frontend expects "userName"
    
    private String userEmail;
    private Long courseId;
    
    @JsonProperty("courseName")
    private String courseTitle; // Frontend expects "courseName"
    
    private String instructorName;
    
    @JsonProperty("issueDate")
    private LocalDateTime issuedAt; // Frontend expects "issueDate" as string (Jackson auto-converts)
    
    @JsonProperty("completionDate")
    private LocalDateTime completedAt; // Frontend expects "completionDate" as string (Jackson auto-converts)
    
    private String pdfUrl; // URL để download PDF
    private String verificationUrl; // Optional verification URL
    
    @JsonProperty("score")
    private Integer finalScore; // Frontend expects "score"
    
    private String status; // ACTIVE, REVOKED, EXPIRED
}

