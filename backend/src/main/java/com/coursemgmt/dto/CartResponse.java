package com.coursemgmt.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CartResponse {
    private Long id;
    private Long userId;
    private List<CartItemResponse> items;
    private Double totalAmount; // Tổng tiền của tất cả items
    private Integer itemCount; // Số lượng items
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

