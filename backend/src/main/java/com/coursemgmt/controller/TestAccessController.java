package com.coursemgmt.controller;

import com.coursemgmt.dto.test.TestResultResponse;
import com.coursemgmt.dto.test.TestSubmissionRequest;
import com.coursemgmt.model.Test;
import com.coursemgmt.model.Test_Result;
import com.coursemgmt.security.services.UserDetailsImpl;
import com.coursemgmt.service.TestService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/tests")
public class TestAccessController {

    @Autowired
    private TestService testService;

    // 1. Học viên lấy thông tin Test (để bắt đầu làm)
    @GetMapping("/{testId}")
    @PreAuthorize("@courseSecurityService.isEnrolledInTest(authentication, #testId)")
    public ResponseEntity<Test> startTest(@PathVariable Long testId) {
        // Lưu ý: Cần tạo DTO để ẩn đáp án, tạm thời trả về cả Entity
        Test test = testService.getTestForStudent(testId);
        return ResponseEntity.ok(test);
    }

    // 2. Học viên nộp bài
    @PostMapping("/{testId}/submit")
    @PreAuthorize("@courseSecurityService.isEnrolledInTest(authentication, #testId)")
    public ResponseEntity<TestResultResponse> submitTest(@PathVariable Long testId,
                                                         @Valid @RequestBody TestSubmissionRequest request,
                                                         @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Test_Result result = testService.submitTest(testId, request, userDetails);
        return ResponseEntity.ok(TestResultResponse.fromEntity(result));
    }

    // 3. Học viên xem kết quả
    @GetMapping("/{testId}/result")
    @PreAuthorize("isAuthenticated()") // Logic kiểm tra quyền sở hữu ở trong service
    public ResponseEntity<TestResultResponse> getResult(@PathVariable Long testId,
                                                        @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Test_Result result = testService.getStudentResult(testId, userDetails);
        return ResponseEntity.ok(TestResultResponse.fromEntity(result));
    }
}