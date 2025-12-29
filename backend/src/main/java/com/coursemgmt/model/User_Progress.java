package com.coursemgmt.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_progress")
@Data
public class User_Progress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Boolean isCompleted = false; // Mặc định là chưa hoàn thành

    private LocalDateTime completedAt;

    // Auto-progress tracking: Track video watch time
    private Integer lastWatchedTime; // Last watched time in seconds

    private Integer totalDuration; // Total video duration in seconds

    // (n-1) Nhiều Tiến độ thuộc 1 Ghi danh
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", nullable = false)
    private Enrollment enrollment;

    // (n-1) Nhiều Tiến độ thuộc 1 Bài học
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;
}