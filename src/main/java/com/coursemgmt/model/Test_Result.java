package com.coursemgmt.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "test_results")
@Data
public class Test_Result {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime submittedAt;
    private Double score;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ESubmissionStatus status; // Enum: PENDING_GRADING, GRADED

    @Lob
    private String feedback; // Nhận xét của giảng viên

    // (n-1) Bài nộp của 1 User
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // (n-1) Bài nộp cho 1 Test
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_id", nullable = false)
    private Test test;

    // (1-n) 1 Bài nộp có nhiều Câu trả lời chi tiết
    @OneToMany(mappedBy = "testResult", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Test_Result_Answer> answers;
}