package com.coursemgmt.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LessonProgressRequest {
    @NotNull(message = "Watched time is required")
    @Min(value = 0, message = "Watched time must be non-negative")
    private Integer watchedTime; // Watched time in seconds

    @NotNull(message = "Total duration is required")
    @Min(value = 1, message = "Total duration must be positive")
    private Integer totalDuration; // Total video duration in seconds
}

