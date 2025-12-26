package com.coursemgmt.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO cho dữ liệu charts của Instructor Dashboard
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InstructorChartDataDTO {
    private List<MonthlyData> earnings; // Doanh thu theo tháng
    private List<MonthlyData> enrollments; // Số lượng đăng ký theo tháng

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyData {
        private String month; // "Tháng 1", "Tháng 2", etc.
        private Double value; // Doanh thu hoặc số lượng đăng ký
    }
}

