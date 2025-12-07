package com.coursemgmt.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CertificateRequest {
    
    @NotNull(message = "Enrollment ID is required")
    private Long enrollmentId;
    
    @Min(value = 0, message = "Final score must be >= 0")
    @Max(value = 100, message = "Final score must be <= 100")
    private Integer finalScore;
}

