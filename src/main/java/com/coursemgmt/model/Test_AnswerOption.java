package com.coursemgmt.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "test_answer_options")
@Data
public class Test_AnswerOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
    @Column(nullable = false)
    private String optionText;

    @Column(nullable = false)
    private Boolean isCorrect;

    // (n-1) Nhiều Lựa chọn thuộc 1 Câu hỏi
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Test_Question question;
}