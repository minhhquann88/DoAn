package com.coursemgmt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MeetingRequest {
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    
    private Long courseId;
    
    // Start time is optional - if null, meeting starts immediately
    private LocalDateTime startTime;
    
    // If true, meeting starts immediately regardless of startTime
    private Boolean startImmediately = false;
    
    @Min(value = 15, message = "Duration must be at least 15 minutes")
    @Max(value = 480, message = "Duration must not exceed 480 minutes (8 hours)")
    private Integer durationMinutes = 60;
    
    @Min(value = 1, message = "Max participants must be at least 1")
    @Max(value = 100, message = "Max participants must not exceed 100")
    private Integer maxParticipants = 50;
    
    private MeetingSettings settings;
    
    @Data
    public static class MeetingSettings {
        private Boolean allowScreenShare = true;
        private Boolean allowChat = true;
        private Boolean muteOnJoin = false;
        private Boolean waitingRoom = false;
        private String password;
    }
}

