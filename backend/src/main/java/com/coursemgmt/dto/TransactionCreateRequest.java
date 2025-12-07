package com.coursemgmt.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TransactionCreateRequest {
    
    @NotNull(message = "User ID is required")
    private Long userId;
    
    @NotNull(message = "Course ID is required")
    private Long courseId;
    
    @NotNull(message = "Amount is required")
    @Min(value = 0, message = "Amount must be >= 0")
    private Double amount;
    
    @NotNull(message = "Payment gateway is required")
    private String paymentGateway; // VNPAY, MOMO, BANK_TRANSFER
    
    private String bankCode; // Optional: NCB, VIETCOMBANK, etc.
    
    private String returnUrl; // URL để redirect sau khi thanh toán
}

