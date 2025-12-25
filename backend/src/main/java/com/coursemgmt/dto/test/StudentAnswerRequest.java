package com.coursemgmt.dto.test;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StudentAnswerRequest {
    @NotNull
    private Long questionId; // Trả lời cho câu hỏi nào

    // CHỌN 1 TRONG 2
    private Long chosenOptionId; // Dùng cho Trắc nghiệm
    private String essayAnswer; // Dùng cho Tự luận
}