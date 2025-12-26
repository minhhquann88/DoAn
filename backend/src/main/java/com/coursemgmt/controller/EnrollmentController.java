package com.coursemgmt.controller;

import com.coursemgmt.dto.*;
import com.coursemgmt.service.EnrollmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.coursemgmt.security.services.UserDetailsImpl;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/enrollments")
public class EnrollmentController {

    @Autowired
    private EnrollmentService enrollmentService;

    /**
     * 1. Lấy danh sách enrollment theo course
     * GET /api/v1/enrollments/course/{courseId}
     * Security: Only Admin or Course Owner (Instructor) can access
     */
    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasRole('ADMIN') or @courseSecurityService.isInstructor(authentication, #courseId)")
    public ResponseEntity<Page<EnrollmentDTO>> getEnrollmentsByCourse(
        @PathVariable Long courseId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<EnrollmentDTO> enrollments = enrollmentService.getEnrollmentsByCourse(courseId, userDetails.getId(), pageable);
        return ResponseEntity.ok(enrollments);
    }

    /**
     * 2. Lấy danh sách enrollment theo student
     * GET /api/v1/enrollments/student/{studentId}
     * Security: Only Admin or the student themselves can access
     */
    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('STUDENT') and @courseSecurityService.isStudentOwner(authentication, #studentId))")
    public ResponseEntity<Page<EnrollmentDTO>> getEnrollmentsByStudent(
        @PathVariable Long studentId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<EnrollmentDTO> enrollments = enrollmentService.getEnrollmentsByStudent(studentId, userDetails.getId(), pageable);
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
     * Security: Only Admin or the student themselves can access
     */
    @GetMapping("/student/{studentId}/history")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('STUDENT') and @courseSecurityService.isStudentOwner(authentication, #studentId))")
    public ResponseEntity<StudentLearningHistoryDTO> getStudentLearningHistory(
        @PathVariable Long studentId,
        @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        StudentLearningHistoryDTO history = enrollmentService.getStudentLearningHistory(studentId, userDetails.getId());
        return ResponseEntity.ok(history);
    }

    /**
     * 9. Lấy danh sách học viên của giảng viên hiện tại (My Students)
     * GET /api/v1/enrollments/my-students
     * Security: Only Instructors can access their own students
     */
    @GetMapping("/my-students")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<Page<EnrollmentDTO>> getMyStudents(
        @RequestParam(required = false) Long courseId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<EnrollmentDTO> enrollments = enrollmentService.getMyStudents(userDetails.getId(), courseId, pageable);
        return ResponseEntity.ok(enrollments);
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

