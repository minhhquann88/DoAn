package com.coursemgmt.dto.test;

import com.coursemgmt.model.EQuestionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class QuestionRequest {
    @NotBlank
    private String questionText;
    @NotNull
    private EQuestionType questionType;

    // Danh sách các lựa chọn (A, B, C...)
    // Sẽ là null hoặc rỗng nếu là câu ESSAY
    @Size(min = 0)
    private List<AnswerOptionRequest> options;
}