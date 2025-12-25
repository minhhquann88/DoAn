package com.coursemgmt.dto.test;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class ManualGradeRequest {
    // Giảng viên sẽ chấm điểm cho từng câu trả lời tự luận
    @NotNull
    private Long testResultAnswerId; // Chấm cho câu trả lời nào

    @NotBlank
    private String feedback; // Nhận xét
}