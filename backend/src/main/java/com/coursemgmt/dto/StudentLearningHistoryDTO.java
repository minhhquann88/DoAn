package com.coursemgmt.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO cho lịch sử học tập của học viên
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentLearningHistoryDTO {
    private Long studentId;
    private String studentName;
    private String email;
    
    // Overall stats
    private Integer totalCoursesEnrolled;
    private Integer coursesCompleted;
    private Integer coursesInProgress;
    private Integer coursesDropped;
    
    private Double overallProgress;
    private Double overallAverageScore;
    
    // Enrollments detail
    private List<EnrollmentDTO> enrollments;
    
    // Activity
    private LocalDateTime lastActivityDate;
    private Integer totalLearningHours;
    
    // Certificates
    private Integer certificatesEarned;
}

