package com.coursemgmt.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho thống kê giảng viên
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InstructorStatsDTO {
    private Long instructorId;
    private String instructorName;
    private String email;
    
    // Khóa học
    private Long totalCourses;
    private Long publishedCourses;
    private Long draftCourses;
    
    // Học viên
    private Long totalStudents;
    private Long activeStudents;
    private Long certificatesIssued;
    
    // Doanh thu
    private Double totalRevenue;
    
    // Đánh giá
    private Double averageCourseRating;
    
    // Hoàn thành
    private Double averageCompletionRate;
}

