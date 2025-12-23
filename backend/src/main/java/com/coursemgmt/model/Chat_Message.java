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

    @Column(name = "session_id")
    private String sessionId; // Để nhóm các tin nhắn trong 1 phiên

    @Lob
    @Column(name = "message_content", nullable = false)
    private String messageContent; // User gửi

    @Lob
    @Column(name = "response_content")
    private String responseContent; // Bot trả lời

    @Column(name = "feedback_rating")
    private Integer feedbackRating; // 1-5 sao

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // (n-1) Tin nhắn của 1 User
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}