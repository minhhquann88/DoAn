package com.coursemgmt.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO cho báo cáo tỷ lệ hoàn thành
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompletionReportDTO {
    // Tổng quan
    private Long totalEnrollments;
    private Long completedEnrollments;
    private Long inProgressEnrollments;
    private Double overallCompletionRate;
    
    // Chi tiết theo khóa học
    private List<CourseCompletionDTO> courseCompletions;
    
    // Chi tiết theo tháng
    private List<MonthlyCompletionDTO> monthlyCompletions;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseCompletionDTO {
        private Long courseId;
        private String courseTitle;
        private Long totalEnrollments;
        private Long completed;
        private Double completionRate;
        private Double averageProgress;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyCompletionDTO {
        private Integer year;
        private Integer month;
        private Long enrollments;
        private Long completions;
        private Double completionRate;
    }
}

