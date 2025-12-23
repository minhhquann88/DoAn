package com.coursemgmt.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "recommendations")
@Data
public class Recommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "recommendation_score")
    private Double recommendationScore;

    private String reason; // Lý do gợi ý

    @Column(name = "generated_at")
    private LocalDateTime generatedAt;

    // (n-1) Gợi ý cho 1 User
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // (n-1) Gợi ý 1 Course
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
}