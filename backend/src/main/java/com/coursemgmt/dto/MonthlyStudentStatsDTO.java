package com.coursemgmt.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO cho thống kê học viên mới theo tháng
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyStudentStatsDTO {
    private Integer year;
    private Integer month;
    private Long newStudents;
    private Long totalEnrollments;
    private Long completedCourses;
    
    // For chart data
    private List<MonthlyData> monthlyData;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyData {
        private Integer year;
        private Integer month;
        private String monthName; // "Jan 2025"
        private Long newStudents;
        private Long enrollments;
        private Long completions;
    }
}

