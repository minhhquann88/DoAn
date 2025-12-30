package com.coursemgmt.dto;

import com.coursemgmt.model.Message;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {
    private Long id;
    private Long conversationId;
    private Long senderId;
    private String senderName;
    private String senderAvatar;
    private String content;
    private String messageType;
    private String fileUrl;
    private String fileName;
    private Long fileSize;
    private Boolean isEdited;
    private LocalDateTime editedAt;
    private Boolean isDeleted;
    private LocalDateTime createdAt;
    private Boolean isRead;
    private LocalDateTime readAt;
    
    public static ChatMessageResponse fromEntity(Message message, Boolean isRead, LocalDateTime readAt) {
        String senderName = message.getSender().getFullName();
        if (senderName == null || senderName.trim().isEmpty()) {
            senderName = message.getSender().getUsername();
        }
        
        return ChatMessageResponse.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .senderId(message.getSender().getId())
                .senderName(senderName)
                .senderAvatar(message.getSender().getAvatarUrl())
                .content(message.getContent())
                .messageType(message.getMessageType().name())
                .fileUrl(message.getFileUrl())
                .fileName(message.getFileName())
                .fileSize(message.getFileSize())
                .isEdited(message.getIsEdited())
                .editedAt(message.getEditedAt())
                .isDeleted(message.getIsDeleted())
                .createdAt(message.getCreatedAt())
                .isRead(isRead != null ? isRead : false)
                .readAt(readAt)
                .build();
    }
}

