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

    // Lấy danh sách enrollment theo course
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

    // Lấy danh sách enrollment theo student
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

    // Tạo enrollment mới
    @PostMapping
    public ResponseEntity<EnrollmentDTO> createEnrollment(
        @Valid @RequestBody EnrollmentCreateRequest request
    ) {
        EnrollmentDTO created = enrollmentService.createEnrollment(request);
        return ResponseEntity.ok(created);
    }

    // Cập nhật trạng thái enrollment
    @PatchMapping("/{id}")
    public ResponseEntity<EnrollmentDTO> updateEnrollment(
        @PathVariable Long id,
        @Valid @RequestBody EnrollmentUpdateRequest request
    ) {
        EnrollmentDTO updated = enrollmentService.updateEnrollment(id, request);
        return ResponseEntity.ok(updated);
    }

    // Lấy lịch sử học tập của học viên
    @GetMapping("/student/{studentId}/history")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('STUDENT') and @courseSecurityService.isStudentOwner(authentication, #studentId))")
    public ResponseEntity<StudentLearningHistoryDTO> getStudentLearningHistory(
        @PathVariable Long studentId,
        @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        StudentLearningHistoryDTO history = enrollmentService.getStudentLearningHistory(studentId, userDetails.getId());
        return ResponseEntity.ok(history);
    }

    // Lấy danh sách học viên của giảng viên hiện tại (My Students)
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
}

