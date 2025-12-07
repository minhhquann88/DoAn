package com.coursemgmt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class CourseRequest {
    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    @NotBlank(message = "Mô tả không được để trống")
    private String description; //

    @NotNull(message = "Giá tiền không được để trống")
    @PositiveOrZero(message = "Giá tiền phải lớn hơn hoặc bằng 0")
    private Double price; //

    private String imageUrl;

    private Integer totalDurationInHours;

    @NotNull(message = "Danh mục không được để trống")
    private Long categoryId; // Gán danh mục
}