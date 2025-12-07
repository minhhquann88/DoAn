package com.coursemgmt.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho tổng quan dashboard
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    // Tổng quan
    private Long totalCourses;
    private Long totalStudents;
    private Long totalInstructors;
    private Long totalEnrollments;
    private Long totalCertificates;
    
    // Doanh thu
    private Double totalRevenue;
    private Double monthlyRevenue;
    private Double yearlyRevenue;
    
    // Khóa học
    private Long activeCourses;
    private Long pendingCourses;
    private Long draftCourses;
    
    // Giao dịch
    private Long successfulTransactions;
    private Long pendingTransactions;
    private Long failedTransactions;
    
    // Tỷ lệ hoàn thành
    private Double averageCompletionRate;
    private Long completedEnrollments;
    private Long inProgressEnrollments;
}

