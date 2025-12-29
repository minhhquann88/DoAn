package com.coursemgmt.controller;

import com.coursemgmt.service.AdminDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/admin/stats")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    @Autowired
    private AdminDashboardService adminDashboardService;

    /**
     * GET /api/v1/admin/stats/summary
     * Trả về các con số tổng quan
     */
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummaryStats() {
        Map<String, Object> stats = adminDashboardService.getSummaryStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * GET /api/v1/admin/stats/revenue-chart
     * Trả về mảng doanh thu theo tháng (12 tháng gần nhất)
     */
    @GetMapping("/revenue-chart")
    public ResponseEntity<List<Map<String, Object>>> getRevenueChart() {
        List<Map<String, Object>> chartData = adminDashboardService.getRevenueChart();
        return ResponseEntity.ok(chartData);
    }

    /**
     * GET /api/v1/admin/stats/top-courses
     * Trả về top 5 khóa học bán chạy nhất
     */
    @GetMapping("/top-courses")
    public ResponseEntity<List<Map<String, Object>>> getTopSellingCourses() {
        List<Map<String, Object>> topCourses = adminDashboardService.getTopSellingCourses();
        return ResponseEntity.ok(topCourses);
    }
}

