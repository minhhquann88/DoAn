package com.coursemgmt.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseAnalyticsResponse {
    private Long courseId;
    private String courseTitle;
    
    // Basic stats
    private Long totalEnrollments;
    private Double totalRevenue;
    private Double completionRate; // Percentage of students who completed the course
    private Double averageRating; // Average rating (if reviews exist)
    
    // Monthly data
    private List<MonthlyEnrollmentData> monthlyEnrollments;
    private List<MonthlyRevenueData> monthlyRevenue;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyEnrollmentData {
        private String month; // Format: "Tháng 1", "Tháng 2", etc.
        private Long enrollments;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyRevenueData {
        private String month; // Format: "Tháng 1", "Tháng 2", etc.
        private Double revenue;
    }
}

