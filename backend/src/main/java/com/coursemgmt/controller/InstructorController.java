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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
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
}
