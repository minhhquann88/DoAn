package com.coursemgmt.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDTO {
    private Long id;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // User info
    private Long userId;
    private String userName;
    private String userFullName;
    private String userAvatar;
    
    // Course info
    private Long courseId;
    private String courseTitle;
    
    // Instructor reply
    private String instructorReply;
    private LocalDateTime repliedAt;
    private String instructorName;
    private String instructorAvatar;
}

