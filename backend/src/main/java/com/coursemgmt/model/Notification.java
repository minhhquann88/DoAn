package com.coursemgmt.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
public class Notification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 500)
    private String message; // Nội dung thông báo
    
    @Column(nullable = false)
    private String type; // Loại thông báo: COURSE_PURCHASED, COURSE_COMPLETED, etc.
    
    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false; // Đã đọc chưa
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    // (n-1) Nhiều thông báo thuộc 1 User (người nhận)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    // (n-1) Thông báo có thể liên quan đến 1 Course (optional)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = true)
    private Course course;
    
    // (n-1) Thông báo có thể liên quan đến 1 Transaction (optional)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = true)
    private Transaction transaction;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isRead == null) {
            isRead = false;
        }
    }
}

