package com.coursemgmt.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO cho danh sách khóa học của Instructor
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InstructorCourseDTO {
    private Long id;
    private String title;
    private String description;
    private Double price;
    private String imageUrl;
    private Long studentsCount; // Số lượng học viên đã đăng ký
    private Boolean isPublished;
    private String status; // PUBLISHED, DRAFT, PENDING_APPROVAL
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

