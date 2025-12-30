package com.coursemgmt.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private String message;
    private String type;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private Long courseId;
    private String courseTitle;
    private String actionUrl;
    
    public static NotificationDTO fromEntity(com.coursemgmt.model.Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setMessage(notification.getMessage());
        dto.setType(notification.getType());
        dto.setIsRead(notification.getIsRead());
        dto.setCreatedAt(notification.getCreatedAt());
        dto.setActionUrl(notification.getActionUrl());
        
        if (notification.getCourse() != null) {
            dto.setCourseId(notification.getCourse().getId());
            dto.setCourseTitle(notification.getCourse().getTitle());
        }
        
        return dto;
    }
}

