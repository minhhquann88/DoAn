package com.coursemgmt.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Table(name = "tests")
@Data
public class Test {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ETestType type; // Enum: MULTIPLE_CHOICE, ESSAY

    private Integer timeLimitInMinutes;

    // (n-1) Nhiều Test thuộc 1 Lesson
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    // (1-n) 1 Test có nhiều Câu hỏi
    @OneToMany(mappedBy = "test", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Test_Question> questions;

    // (1-n) 1 Test có nhiều Bài nộp
    @OneToMany(mappedBy = "test")
    private List<Test_Result> results;
}