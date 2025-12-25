package com.coursemgmt.controller;

import com.coursemgmt.dto.MessageResponse;
import com.coursemgmt.service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller cho Chatbot AI - cung cấp context cho chatbot
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private StatisticsService statisticsService;

    /**
     * Lấy context cho chatbot AI
     * GET /api/chat/context
     * 
     * Trả về thông tin học tập của user để chatbot có thể trả lời chính xác hơn
     */
    @GetMapping("/context")
    public ResponseEntity<Map<String, Object>> getChatContext(
        @RequestParam(required = false) Long userId,
        @RequestParam(required = false) String question
    ) {
        Map<String, Object> context = new HashMap<>();
        
        // Nếu có userId, lấy thống kê của user đó
        if (userId != null) {
            try {
                var studentStats = statisticsService.getStudentStats(userId);
                context.put("userName", studentStats.getStudentName());
                context.put("summary", Map.of(
                    "totalCourses", studentStats.getTotalEnrollments() != null ? studentStats.getTotalEnrollments() : 0,
                    "completedCourses", studentStats.getCompletedCourses() != null ? studentStats.getCompletedCourses() : 0,
                    "averageScore", studentStats.getAverageScore() != null ? studentStats.getAverageScore() : 0.0,
                    "completionRate", studentStats.getCompletionRate() != null ? studentStats.getCompletionRate() : 0.0
                ));
            } catch (Exception e) {
                // Nếu không tìm thấy user, trả về context rỗng
            }
        }
        
        // Thêm thông tin tổng quan hệ thống
        try {
            var dashboardStats = statisticsService.getDashboardStats();
            context.put("systemStats", Map.of(
                "totalCourses", dashboardStats.getTotalCourses(),
                "totalStudents", dashboardStats.getTotalStudents(),
                "totalInstructors", dashboardStats.getTotalInstructors()
            ));
        } catch (Exception e) {
            // Ignore errors
        }
        
        context.put("lastUpdated", java.time.LocalDateTime.now().toString());
        
        return ResponseEntity.ok(context);
    }

    /**
     * Health check cho chatbot service
     * GET /api/chat/health
     */
    @GetMapping("/health")
    public ResponseEntity<MessageResponse> health() {
        return ResponseEntity.ok(new MessageResponse("Chat service is running"));
    }
}

