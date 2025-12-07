package com.coursemgmt.controller;

import com.coursemgmt.dto.*;
import com.coursemgmt.model.Course;
import com.coursemgmt.service.InstructorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/instructors")
public class InstructorController {

    @Autowired
    private InstructorService instructorService;

    /**
     * 1. Lấy danh sách tất cả giảng viên
     * GET /api/v1/instructors
     */
    @GetMapping
    public ResponseEntity<Page<InstructorDTO>> getAllInstructors(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<InstructorDTO> instructors = instructorService.getAllInstructors(pageable);
        return ResponseEntity.ok(instructors);
    }

    /**
     * 2. Lấy thông tin giảng viên theo ID
     * GET /api/v1/instructors/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<InstructorDTO> getInstructorById(@PathVariable Long id) {
        InstructorDTO instructor = instructorService.getInstructorById(id);
        return ResponseEntity.ok(instructor);
    }

    /**
     * 3. Lấy thông tin giảng viên với thống kê
     * GET /api/v1/instructors/{id}/stats
     */
    @GetMapping("/{id}/stats")
    public ResponseEntity<InstructorDTO> getInstructorWithStats(@PathVariable Long id) {
        InstructorDTO instructor = instructorService.getInstructorWithStats(id);
        return ResponseEntity.ok(instructor);
    }

    /**
     * 4. Tạo giảng viên mới (Admin only)
     * POST /api/v1/instructors
     */
    @PostMapping
    public ResponseEntity<InstructorDTO> createInstructor(
        @Valid @RequestBody InstructorCreateRequest request
    ) {
        InstructorDTO created = instructorService.createInstructor(request);
        return ResponseEntity.ok(created);
    }

    /**
     * 5. Cập nhật thông tin giảng viên (Admin only)
     * PUT /api/v1/instructors/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<InstructorDTO> updateInstructor(
        @PathVariable Long id,
        @Valid @RequestBody InstructorUpdateRequest request
    ) {
        InstructorDTO updated = instructorService.updateInstructor(id, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * 6. Xóa giảng viên (Admin only)
     * DELETE /api/v1/instructors/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInstructor(@PathVariable Long id) {
        instructorService.deleteInstructor(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * 7. Cập nhật trạng thái giảng viên (Admin only)
     * PATCH /api/v1/instructors/{id}/status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<InstructorDTO> updateInstructorStatus(
        @PathVariable Long id,
        @RequestParam String status
    ) {
        InstructorDTO updated = instructorService.updateInstructorStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    /**
     * 8. Lấy danh sách khóa học của giảng viên
     * GET /api/v1/instructors/{id}/courses
     */
    @GetMapping("/{id}/courses")
    public ResponseEntity<List<Course>> getInstructorCourses(@PathVariable Long id) {
        List<Course> courses = instructorService.getInstructorCourses(id);
        return ResponseEntity.ok(courses);
    }
}

