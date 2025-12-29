package com.coursemgmt.dto;

import com.coursemgmt.model.Message;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SendMessageRequest {
    @NotNull(message = "Conversation ID is required")
    private Long conversationId;
    
    @NotBlank(message = "Content is required")
    private String content;
    
    private Message.MessageType messageType = Message.MessageType.TEXT;
    
    private String fileUrl;
    private String fileName;
    private Long fileSize;
}

