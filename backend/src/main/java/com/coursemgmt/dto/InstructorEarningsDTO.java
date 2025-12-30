package com.coursemgmt.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO cho trang Doanh thu của Instructor
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InstructorEarningsDTO {
    private Double totalRevenue; // Tổng doanh thu
    private Double availableBalance; // Có thể rút (tổng doanh thu - đang chờ)
    private Double pendingBalance; // Đang chờ thanh toán
    private Double growthRate; // Tỷ lệ tăng trưởng (%)
    private List<TransactionDTO> recentTransactions; // Giao dịch gần đây
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionDTO {
        private Long id;
        private String courseTitle;
        private String studentName;
        private Double amount;
        private String date;
        private String status; // "completed" hoặc "pending"
    }
}

