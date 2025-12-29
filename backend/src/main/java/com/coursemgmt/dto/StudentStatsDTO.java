package com.coursemgmt.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho thống kê học viên
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentStatsDTO {
    private Long studentId;
    private String studentName;
    private String email;
    
    // Khóa học
    private Long totalEnrollments;
    private Long completedCourses;
    private Long inProgressCourses;
    
    // Tiến độ
    private Double averageProgress;
    private Double completionRate;
    
    // Điểm số
    private Double averageScore;
    
    // Chứng chỉ
    private Long totalCertificates;
    
    // Hoạt động
    private String lastAccessDate;
    private Long totalLearningHours;
}

