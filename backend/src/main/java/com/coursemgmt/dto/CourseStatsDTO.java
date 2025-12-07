package com.coursemgmt.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho thống kê 1 khóa học
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseStatsDTO {
    private Long courseId;
    private String courseTitle;
    private String instructorName;
    
    // Số lượng
    private Long totalEnrollments;
    private Long activeStudents;
    private Long completedStudents;
    private Long certificatesIssued;
    
    // Tỷ lệ
    private Double completionRate; // % học viên hoàn thành
    private Double averageProgress; // Tiến độ trung bình
    private Double averageScore; // Điểm trung bình
    
    // Doanh thu
    private Double totalRevenue;
    private Long totalTransactions;
    
    // Đánh giá (nếu có)
    private Double averageRating;
    private Long totalReviews;
}

