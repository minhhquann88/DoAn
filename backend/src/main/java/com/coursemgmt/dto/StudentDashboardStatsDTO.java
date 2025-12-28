package com.coursemgmt.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentDashboardStatsDTO {
    private Long activeCourses; // Số khóa học đang học
    private Double totalStudyHours; // Tổng giờ học
    private Double weeklyStudyHours; // Giờ học tuần này
    private Double averageProgress; // Tiến độ trung bình (%)
    private Long totalCertificates; // Tổng số chứng chỉ
}

