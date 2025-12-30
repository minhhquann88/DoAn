package com.coursemgmt.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DeleteMessageRequest {
    @NotNull(message = "Message ID is required")
    private Long messageId;
    
    @NotNull(message = "Conversation ID is required")
    private Long conversationId;
}

