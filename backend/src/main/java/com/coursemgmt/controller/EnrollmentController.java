package com.coursemgmt.controller;

import com.coursemgmt.dto.*;
import com.coursemgmt.service.EnrollmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/enrollments")
public class EnrollmentController {

    @Autowired
    private EnrollmentService enrollmentService;

    /**
     * 1. Lấy danh sách enrollment theo course
     * GET /api/v1/enrollments/course/{courseId}
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<Page<EnrollmentDTO>> getEnrollmentsByCourse(
        @PathVariable Long courseId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<EnrollmentDTO> enrollments = enrollmentService.getEnrollmentsByCourse(courseId, pageable);
        return ResponseEntity.ok(enrollments);
    }

    /**
     * 2. Lấy danh sách enrollment theo student
     * GET /api/v1/enrollments/student/{studentId}
     */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<Page<EnrollmentDTO>> getEnrollmentsByStudent(
        @PathVariable Long studentId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<EnrollmentDTO> enrollments = enrollmentService.getEnrollmentsByStudent(studentId, pageable);
        return ResponseEntity.ok(enrollments);
    }

    /**
     * 3. Lấy chi tiết enrollment
     * GET /api/v1/enrollments/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<EnrollmentDTO> getEnrollmentById(@PathVariable Long id) {
        EnrollmentDTO enrollment = enrollmentService.getEnrollmentById(id);
        return ResponseEntity.ok(enrollment);
    }

    /**
     * 4. Tạo enrollment mới
     * POST /api/v1/enrollments
     */
    @PostMapping
    public ResponseEntity<EnrollmentDTO> createEnrollment(
        @Valid @RequestBody EnrollmentCreateRequest request
    ) {
        EnrollmentDTO created = enrollmentService.createEnrollment(request);
        return ResponseEntity.ok(created);
    }

    /**
     * 5. Cập nhật trạng thái enrollment
     * PATCH /api/v1/enrollments/{id}
     */
    @PatchMapping("/{id}")
    public ResponseEntity<EnrollmentDTO> updateEnrollment(
        @PathVariable Long id,
        @Valid @RequestBody EnrollmentUpdateRequest request
    ) {
        EnrollmentDTO updated = enrollmentService.updateEnrollment(id, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * 6. Xóa học viên khỏi khóa học (Admin only)
     * DELETE /api/v1/enrollments/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeEnrollment(@PathVariable Long id) {
        enrollmentService.removeEnrollment(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * 7. Lấy lịch sử học tập của học viên
     * GET /api/v1/enrollments/student/{studentId}/history
     */
    @GetMapping("/student/{studentId}/history")
    public ResponseEntity<StudentLearningHistoryDTO> getStudentLearningHistory(
        @PathVariable Long studentId
    ) {
        StudentLearningHistoryDTO history = enrollmentService.getStudentLearningHistory(studentId);
        return ResponseEntity.ok(history);
    }

    /**
     * 8. Thống kê học viên mới theo tháng
     * GET /api/v1/enrollments/stats/monthly?year=2025
     */
    @GetMapping("/stats/monthly")
    public ResponseEntity<MonthlyStudentStatsDTO> getMonthlyStudentStats(
        @RequestParam(defaultValue = "2025") int year
    ) {
        MonthlyStudentStatsDTO stats = enrollmentService.getMonthlyStudentStats(year);
        return ResponseEntity.ok(stats);
    }
}

