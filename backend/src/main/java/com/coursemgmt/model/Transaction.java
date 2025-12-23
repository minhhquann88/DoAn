package com.coursemgmt.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double amount;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ETransactionStatus status; // Enum: PENDING, SUCCESS, FAILED

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_gateway", length = 20)
    private EPaymentGateway paymentGateway; // Enum: VNPAY, MOMO

    @Column(name = "transaction_code")
    private String transactionCode; // Mã giao dịch từ cổng thanh toán
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // (n-1) Giao dịch của 1 User
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // (n-1) Giao dịch cho 1 Course
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
}