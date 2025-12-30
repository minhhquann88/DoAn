package com.coursemgmt.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO cho danh sách học viên của Instructor
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InstructorStudentDTO {
    private Long enrollmentId;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private Long courseId;
    private String courseTitle;
    private Double progress; // Tiến độ học tập (%)
    private LocalDateTime enrolledAt; // Ngày đăng ký
    private LocalDateTime lastActive; // Hoạt động gần nhất (từ User_Progress)
    private String status; // IN_PROGRESS, COMPLETED
}

