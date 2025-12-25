package com.coursemgmt.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TransactionDTO {
    private Long id;
    private Long userId;
    private String userFullName;
    private Long courseId;
    private String courseTitle;
    private Double amount;
    private String paymentGateway; // VNPAY, MOMO, BANK_TRANSFER
    private String transactionStatus; // PENDING, SUCCESS, FAILED, REFUNDED
    private String transactionCode; // Mã giao dịch từ cổng thanh toán
    private String bankCode;
    private String cardType;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}

