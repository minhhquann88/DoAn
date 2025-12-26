package com.coursemgmt.controller;

import com.coursemgmt.dto.*;
import com.coursemgmt.service.ExcelService;
import com.coursemgmt.service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.coursemgmt.security.services.UserDetailsImpl;

import java.io.IOException;
import java.time.LocalDateTime;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/statistics")
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    @Autowired
    private ExcelService excelService;

    /**
     * 1. Lấy tổng quan dashboard (Admin only)
     * GET /api/v1/statistics/dashboard
     * Security: Only Admin can access system-wide statistics
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
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
     * Security: Only Admin or the instructor themselves can access
     */
    @GetMapping("/instructor/{instructorId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('LECTURER') and #instructorId == authentication.principal.id)")
    public ResponseEntity<InstructorStatsDTO> getInstructorStats(
        @PathVariable Long instructorId,
        @AuthenticationPrincipal UserDetailsImpl userDetails
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
     * 5. Báo cáo doanh thu (Admin only)
     * GET /api/v1/statistics/revenue
     * Security: Only Admin can access system-wide revenue reports
     */
    @GetMapping("/revenue")
    @PreAuthorize("hasRole('ADMIN')")
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
     * 6. Báo cáo tỷ lệ hoàn thành (Admin only)
     * GET /api/v1/statistics/completion
     * Security: Only Admin can access system-wide completion reports
     */
    @GetMapping("/completion")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CompletionReportDTO> getCompletionReport() {
        CompletionReportDTO report = statisticsService.getCompletionReport();
        return ResponseEntity.ok(report);
    }

    /**
     * 7. Xuất báo cáo doanh thu ra Excel (Admin only)
     * GET /api/v1/statistics/revenue/export
     */
    @GetMapping("/revenue/export")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Resource> exportRevenueReport(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) 
        LocalDateTime startDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) 
        LocalDateTime endDate
    ) throws IOException {
        var inputStream = excelService.exportRevenueReport(startDate, endDate);
        
        String filename = "BaoCaoDoanhThu_" + 
            startDate.format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd")) + "_" +
            endDate.format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd")) + ".xlsx";
        
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=" + filename);
        
        return ResponseEntity
            .ok()
            .headers(headers)
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .body(new InputStreamResource(inputStream));
    }
}
