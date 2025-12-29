package com.coursemgmt.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CartItemResponse {
    private Long id;
    private CourseResponse course;
    private LocalDateTime addedAt;
}

