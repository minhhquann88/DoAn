package com.coursemgmt.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private String paymentUrl; // URL để redirect đến cổng thanh toán
    private String transactionCode;
    private String message;
    private String status; // SUCCESS, ERROR
}

