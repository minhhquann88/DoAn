package com.coursemgmt.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Data
public class Chat_Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sessionId; // Để nhóm các tin nhắn trong 1 phiên

    @Lob
    @Column(nullable = false)
    private String messageContent; // User gửi

    @Lob
    private String responseContent; // Bot trả lời

    private Integer feedbackRating; // 1-5 sao

    private LocalDateTime createdAt;

    // (n-1) Tin nhắn của 1 User
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}