package com.coursemgmt.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "newsletter_subscriptions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"email"})
})
@Data
public class NewsletterSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "subscribed_at", nullable = false)
    private LocalDateTime subscribedAt;

    @Column(name = "user_id")
    private Long userId; // Null nếu là guest, có giá trị nếu là user đã đăng nhập

    @PrePersist
    protected void onCreate() {
        subscribedAt = LocalDateTime.now();
        if (isActive == null) {
            isActive = true;
        }
    }
}

