package com.coursemgmt.dto.test;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.List;

@Data
public class TestSubmissionRequest {
    @NotNull
    @Size(min = 1)
    private List<StudentAnswerRequest> answers;
}