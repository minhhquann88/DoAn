package com.coursemgmt.controller;

import com.coursemgmt.dto.test.*;
import com.coursemgmt.model.Test;
import com.coursemgmt.model.Test_Result;
import com.coursemgmt.service.TestService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/manage/tests")
public class TestManagementController {

    @Autowired
    private TestService testService;

    // 1. Giảng viên tạo bài Test
    @PostMapping("/lessons/{lessonId}")
    @PreAuthorize("hasRole('ADMIN') or @courseSecurityService.isInstructorOfLesson(authentication, #lessonId)")
    public ResponseEntity<Test> createTest(@PathVariable Long lessonId, @Valid @RequestBody TestRequest request) {
        Test test = testService.createTest(lessonId, request);
        return ResponseEntity.ok(test);
    }

    // 2. Giảng viên xem tất cả bài nộp
    @GetMapping("/{testId}/submissions")
    @PreAuthorize("hasRole('ADMIN') or @courseSecurityService.isInstructorOfTest(authentication, #testId)")
    public ResponseEntity<List<TestResultResponse>> getAllSubmissions(@PathVariable Long testId) {
        List<TestResultResponse> responses = testService.getAllSubmissionsForTest(testId).stream()
                .map(TestResultResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    // 3. Giảng viên chấm bài tự luận
    @PostMapping("/grade-essay")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LECTURER')") // (Cần kiểm tra quyền sở hữu sâu hơn trong service)
    public ResponseEntity<TestResultResponse> gradeEssay(@Valid @RequestBody ManualGradeRequest request) {
        // Tạm gán 5 điểm cho câu tự luận này.
        // Bạn cần phát triển logic tính điểm (ví dụ: /10)
        double scoreForThisQuestion = 5.0;
        Test_Result result = testService.gradeEssay(request, scoreForThisQuestion);
        return ResponseEntity.ok(TestResultResponse.fromEntity(result));
    }

    // 4. Giảng viên xem thống kê
    @GetMapping("/{testId}/statistics")
    @PreAuthorize("hasRole('ADMIN') or @courseSecurityService.isInstructorOfTest(authentication, #testId)")
    public ResponseEntity<TestStatisticsResponse> getTestStatistics(@PathVariable Long testId) {
        return ResponseEntity.ok(testService.getTestStatistics(testId));
    }

    // 5. Giảng viên/Admin lấy chi tiết bài Test (để xem/sửa)
    @GetMapping("/{testId}")
    @PreAuthorize("hasRole('ADMIN') or @courseSecurityService.isInstructorOfTest(authentication, #testId)")
    public ResponseEntity<Test> getTestDetails(@PathVariable Long testId) {
        Test test = testService.getTestDetailsForManagement(testId);
        return ResponseEntity.ok(test);
    }
}