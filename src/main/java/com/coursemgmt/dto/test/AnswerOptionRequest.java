package com.coursemgmt.dto.test;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AnswerOptionRequest {
    @NotBlank
    private String optionText;
    @NotNull
    private Boolean isCorrect;
}