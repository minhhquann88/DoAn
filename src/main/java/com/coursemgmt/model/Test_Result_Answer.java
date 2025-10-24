package com.coursemgmt.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "test_result_answers")
@Data
public class Test_Result_Answer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
    private String essayAnswer; // Câu trả lời tự luận

    // (n-1) Thuộc 1 Bài nộp (Test_Result)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_result_id", nullable = false)
    private Test_Result testResult;

    // (n-1) Trả lời cho 1 Câu hỏi (Test_Question)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Test_Question question;

    // (n-1) Lựa chọn trắc nghiệm (có thể null nếu là tự luận)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chosen_option_id")
    private Test_AnswerOption chosenOption;
}