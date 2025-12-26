package com.coursemgmt.dto;

import com.coursemgmt.model.Course;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CourseResponse {
    private Long id;
    private String title;
    private String description;
    private Double price;
    private String imageUrl;
    private Integer totalDurationInHours;
    private String status;
    private LocalDateTime createdAt;
    private Long enrollmentCount; // Số lượng học viên đã đăng ký
    private Boolean isFeatured; // Khóa học nổi bật
    private Boolean isPublished; // Khóa học đã được publish

    // Thông tin lồng nhau
    private CategoryInfo category;
    private InstructorInfo instructor;

    @Data
    private static class CategoryInfo {
        private Long id;
        private String name;
    }

    @Data
    private static class InstructorInfo {
        private Long id;
        private String fullName;
        private String avatarUrl;
    }

    // Tiện ích để chuyển từ Entity sang DTO
    public static CourseResponse fromEntity(Course course) {
        CourseResponse dto = new CourseResponse();
        dto.setId(course.getId());
        dto.setTitle(course.getTitle());
        dto.setDescription(course.getDescription());
        dto.setPrice(course.getPrice());
        dto.setImageUrl(course.getImageUrl());
        dto.setTotalDurationInHours(course.getTotalDurationInHours());
        dto.setStatus(course.getStatus().name());
        dto.setCreatedAt(course.getCreatedAt());
        dto.setIsFeatured(course.getIsFeatured() != null ? course.getIsFeatured() : false);
        dto.setIsPublished(course.getIsPublished() != null ? course.getIsPublished() : true);

        if (course.getCategory() != null) {
            CategoryInfo catInfo = new CategoryInfo();
            catInfo.setId(course.getCategory().getId());
            catInfo.setName(course.getCategory().getName());
            dto.setCategory(catInfo);
        }

        if (course.getInstructor() != null) {
            InstructorInfo insInfo = new InstructorInfo();
            insInfo.setId(course.getInstructor().getId());
            insInfo.setFullName(course.getInstructor().getFullName());
            insInfo.setAvatarUrl(course.getInstructor().getAvatarUrl());
            dto.setInstructor(insInfo);
        }

        // Note: enrollmentCount sẽ được set trong Service layer để tránh LAZY loading issue
        // Default value là 0L, sẽ được override trong service

        return dto;
    }
}