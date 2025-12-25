package com.coursemgmt.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CourseStatisticsResponse {
    private Long courseId;
    private String courseTitle;
    private Long totalEnrollments; // Thống kê số lượng
}