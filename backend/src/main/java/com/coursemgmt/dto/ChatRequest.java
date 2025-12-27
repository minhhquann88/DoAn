package com.coursemgmt.dto;

import lombok.Data;

@Data
public class ChatRequest {
    private String message;
    private Long courseId; // Optional: để lấy context cụ thể từ khóa học
}

