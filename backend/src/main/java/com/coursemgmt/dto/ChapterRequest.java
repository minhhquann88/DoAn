package com.coursemgmt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChapterRequest {
    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    @NotNull(message = "Vui lòng cung cấp thứ tự")
    private Integer position;
}