package com.coursemgmt.controller;

import com.coursemgmt.dto.*;
import com.coursemgmt.service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/statistics")
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    /**
     * 1. Lấy tổng quan dashboard
     * GET /api/v1/statistics/dashboard
     */
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        DashboardStatsDTO stats = statisticsService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * 2. Thống kê chi tiết 1 khóa học
     * GET /api/v1/statistics/course/{courseId}
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<CourseStatsDTO> getCourseStats(@PathVariable Long courseId) {
        CourseStatsDTO stats = statisticsService.getCourseStats(courseId);
        return ResponseEntity.ok(stats);
    }

    /**
     * 3. Thống kê giảng viên
     * GET /api/v1/statistics/instructor/{instructorId}
     */
    @GetMapping("/instructor/{instructorId}")
    public ResponseEntity<InstructorStatsDTO> getInstructorStats(
        @PathVariable Long instructorId
    ) {
        InstructorStatsDTO stats = statisticsService.getInstructorStats(instructorId);
        return ResponseEntity.ok(stats);
    }

    /**
     * 4. Thống kê học viên
     * GET /api/v1/statistics/student/{studentId}
     */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<StudentStatsDTO> getStudentStats(
        @PathVariable Long studentId
    ) {
        StudentStatsDTO stats = statisticsService.getStudentStats(studentId);
        return ResponseEntity.ok(stats);
    }

    /**
     * 5. Báo cáo doanh thu
     * GET /api/v1/statistics/revenue
     */
    @GetMapping("/revenue")
    public ResponseEntity<RevenueStatsDTO> getRevenueReport(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) 
        LocalDateTime startDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) 
        LocalDateTime endDate
    ) {
        RevenueStatsDTO report = statisticsService.getRevenueReport(startDate, endDate);
        return ResponseEntity.ok(report);
    }

    /**
     * 6. Báo cáo tỷ lệ hoàn thành
     * GET /api/v1/statistics/completion
     */
    @GetMapping("/completion")
    public ResponseEntity<CompletionReportDTO> getCompletionReport() {
        CompletionReportDTO report = statisticsService.getCompletionReport();
        return ResponseEntity.ok(report);
    }
}

