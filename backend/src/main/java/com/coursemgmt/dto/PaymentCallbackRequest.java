package com.coursemgmt.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class PaymentCallbackRequest {
    
    @NotBlank(message = "Transaction code is required")
    private String txnCode;
    
    @NotBlank(message = "Status is required")
    private String status; // SUCCESS, FAILED
}

