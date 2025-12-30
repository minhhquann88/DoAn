package com.coursemgmt.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho thống kê tổng quan của Instructor Dashboard
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InstructorDashboardStatsDTO {
    private Long totalCourses; // Tổng số khóa học
    private Long totalStudents; // Tổng số học viên đã đăng ký
    private Double totalEarnings; // Tổng doanh thu
    private Double averageRating; // Đánh giá trung bình (từ reviews)
}

