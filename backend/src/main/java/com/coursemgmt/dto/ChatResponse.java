package com.coursemgmt.dto;

import lombok.Data;

@Data
public class ChatResponse {
    private String response;
    private String message; // Alias for backward compatibility
    private Long courseId; // ID khóa học được sử dụng trong context (nếu có)
}

