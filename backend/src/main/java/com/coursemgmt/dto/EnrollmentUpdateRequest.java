package com.coursemgmt.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request để update enrollment
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentUpdateRequest {
    private String status; // IN_PROGRESS, COMPLETED
    
    @Min(value = 0, message = "Progress must be >= 0")
    @Max(value = 100, message = "Progress must be <= 100")
    private Double progress;
    
    @Min(value = 0, message = "Score must be >= 0")
    @Max(value = 100, message = "Score must be <= 100")
    private Double currentScore;
}

