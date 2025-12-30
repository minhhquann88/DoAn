package com.coursemgmt.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateMessageRequest {
    @NotBlank(message = "Content is required")
    private String content;
}

