package com.coursemgmt.dto.test;

//(Output) Dùng cho Học viên xem kết quả.

import com.coursemgmt.model.Test_Result;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TestResultResponse {
    private Long resultId;
    private Long testId;
    private String testTitle;
    private Long userId;
    private String studentName;
    private Double score;
    private String status;
    private LocalDateTime submittedAt;
    private String feedback; // Nhận xét chung (nếu có)
    // (Bạn có thể thêm 1 list chi tiết các câu trả lời)

    public static TestResultResponse fromEntity(Test_Result result) {
        TestResultResponse dto = new TestResultResponse();
        dto.setResultId(result.getId());
        dto.setTestId(result.getTest().getId());
        dto.setTestTitle(result.getTest().getTitle());
        dto.setUserId(result.getUser().getId());
        dto.setStudentName(result.getUser().getFullName());
        dto.setScore(result.getScore());
        dto.setStatus(result.getStatus().name());
        dto.setSubmittedAt(result.getSubmittedAt());
        dto.setFeedback(result.getFeedback());
        return dto;
    }
}