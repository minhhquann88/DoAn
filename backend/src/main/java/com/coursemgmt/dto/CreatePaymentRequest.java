package com.coursemgmt.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CreatePaymentRequest {
    
    @NotNull(message = "Course ID is required")
    private Long courseId;
}

