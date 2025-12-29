package com.coursemgmt.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateConversationRequest {
    @NotNull(message = "User ID is required")
    private Long userId; // ID của người muốn chat (student hoặc instructor)
    
    private Long courseId; // Optional: ID khóa học để validate enrollment (cho student chat với instructor)
}

