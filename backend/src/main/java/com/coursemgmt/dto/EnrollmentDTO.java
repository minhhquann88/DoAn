package com.coursemgmt.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO cho Enrollment (Học viên đăng ký khóa học)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentDTO {
    private Long id;
    
    // Student info
    private Long studentId;
    private String studentName;
    private String studentEmail;
    
    // Course info
    private Long courseId;
    private String courseTitle;
    private String instructorName;
    
    // Enrollment details
    private String status; // ACTIVE, COMPLETED, DROPPED, SUSPENDED
    private Double progress; // 0-100%
    private Double currentScore;
    private LocalDateTime enrolledAt;
    private LocalDateTime completedAt;
    private LocalDateTime lastAccessedAt;
    
    // Learning stats
    private Integer completedLessons;
    private Integer totalLessons;
    private Integer testsTaken;
    private Double averageTestScore;
    
    // Payment info
    private Boolean isPaid;
    private Double paidAmount;
}

