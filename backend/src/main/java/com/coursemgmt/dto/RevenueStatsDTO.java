package com.coursemgmt.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO cho thống kê doanh thu
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RevenueStatsDTO {
    private LocalDate startDate;
    private LocalDate endDate;
    
    // Tổng quan
    private Double totalRevenue;
    private Long totalTransactions;
    private Double averageTransactionValue;
    
    // Chi tiết theo thời gian
    private List<MonthlyRevenueDTO> monthlyRevenue;
    
    // Top courses bán chạy
    private List<TopSellingCourseDTO> topSellingCourses;
    
    // Phương thức thanh toán
    private Long vnpayTransactions;
    private Long momoTransactions;
    private Long bankTransferTransactions;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyRevenueDTO {
        private Integer year;
        private Integer month;
        private Double revenue;
        private Long transactions;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopSellingCourseDTO {
        private Long courseId;
        private String courseTitle;
        private Long totalSales;
        private Double revenue;
    }
}

