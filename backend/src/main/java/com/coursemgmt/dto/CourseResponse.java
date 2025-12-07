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

        return dto;
    }
}