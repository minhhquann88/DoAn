package com.coursemgmt.controller;

import com.coursemgmt.dto.StudentDashboardStatsDTO;
import com.coursemgmt.security.services.UserDetailsImpl;
import com.coursemgmt.service.StudentDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/student/dashboard")
@PreAuthorize("hasRole('STUDENT')")
public class StudentDashboardController {

    @Autowired
    private StudentDashboardService studentDashboardService;

    /**
     * GET /api/student/dashboard/stats
     * Lấy thống kê tổng quan cho Student Dashboard
     */
    @GetMapping("/stats")
    public ResponseEntity<StudentDashboardStatsDTO> getDashboardStats(
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        StudentDashboardStatsDTO stats = studentDashboardService.getDashboardStats(userDetails.getId());
        return ResponseEntity.ok(stats);
    }
}

