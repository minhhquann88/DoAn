package com.coursemgmt.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Table(name = "test_questions")
@Data
public class Test_Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
    @Column(nullable = false)
    private String questionText;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private EQuestionType questionType; // Enum: SINGLE_CHOICE, MULTIPLE_CHOICE, ESSAY

    // (n-1) Nhiều Câu hỏi thuộc 1 Test
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_id", nullable = false)
    private Test test;

    // (1-n) 1 Câu hỏi có nhiều Lựa chọn
    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Test_AnswerOption> options;
}