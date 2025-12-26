package com.coursemgmt.controller;

import com.coursemgmt.dto.InstructorDashboardStatsDTO;
import com.coursemgmt.dto.InstructorCourseDTO;
import com.coursemgmt.dto.InstructorChartDataDTO;
import com.coursemgmt.security.services.UserDetailsImpl;
import com.coursemgmt.service.InstructorDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/instructor")
public class InstructorDashboardController {

    @Autowired
    private InstructorDashboardService instructorDashboardService;

    /**
     * 1. Lấy thống kê tổng quan cho Instructor Dashboard
     * GET /api/instructor/stats
     * Security: Chỉ Instructor mới có quyền truy cập
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<InstructorDashboardStatsDTO> getDashboardStats(
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        InstructorDashboardStatsDTO stats = instructorDashboardService.getDashboardStats(userDetails.getId());
        return ResponseEntity.ok(stats);
    }

    /**
     * 2. Lấy danh sách khóa học của Instructor
     * GET /api/instructor/courses
     * Security: Chỉ Instructor mới có quyền truy cập
     */
    @GetMapping("/courses")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<List<InstructorCourseDTO>> getMyCourses(
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        List<InstructorCourseDTO> courses = instructorDashboardService.getMyCourses(userDetails.getId());
        return ResponseEntity.ok(courses);
    }

    /**
     * 3. Lấy dữ liệu charts cho Dashboard
     * GET /api/instructor/dashboard/charts
     * Security: Chỉ Instructor mới có quyền truy cập
     */
    @GetMapping("/dashboard/charts")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<InstructorChartDataDTO> getChartData(
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        InstructorChartDataDTO chartData = instructorDashboardService.getChartData(userDetails.getId());
        return ResponseEntity.ok(chartData);
    }
}

