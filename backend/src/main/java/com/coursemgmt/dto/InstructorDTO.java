package com.coursemgmt.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO cho Instructor (Giảng viên)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InstructorDTO {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String bio;
    private String expertise; // Chuyên môn
    private String profileImage;
    
    // Statistics
    private Integer totalCourses;
    private Integer publishedCourses;
    private Integer totalStudents;
    private Double averageRating;
    private Long totalRevenue;
    
    // Account info
    private String accountStatus; // ACTIVE, INACTIVE, SUSPENDED
    private LocalDateTime joinedAt;
    private LocalDateTime lastLoginAt;
}

