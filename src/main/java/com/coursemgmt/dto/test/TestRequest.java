package com.coursemgmt.dto.test;

import com.coursemgmt.model.ETestType;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class TestRequest {
    @NotBlank
    private String title;
    @NotNull
    private ETestType type;

    // Thiết lập thời gian
    private LocalDateTime openTime; // Thời gian mở
    private LocalDateTime closeTime; // Thời gian đóng
    private Integer timeLimitInMinutes; // Giới hạn phút làm bài

    @NotNull
    @Size(min = 1, message = "Bài kiểm tra phải có ít nhất 1 câu hỏi")
    private List<QuestionRequest> questions;
}