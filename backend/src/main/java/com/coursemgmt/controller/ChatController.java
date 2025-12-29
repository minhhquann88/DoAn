package com.coursemgmt.controller;

import com.coursemgmt.dto.ChatRequest;
import com.coursemgmt.dto.ChatResponse;
import com.coursemgmt.dto.MessageResponse;
import com.coursemgmt.service.ChatService;
import com.coursemgmt.service.StatisticsService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller cho Chatbot AI - UC-CHAT-01
 * Tích hợp Google Gemini API với RAG (Retrieval Augmented Generation)
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private StatisticsService statisticsService;

    /**
     * UC-CHAT-01: Gửi câu hỏi đến chatbot
     * POST /api/v1/chat/message
     * 
     * Cho phép cả người dùng đã đăng nhập và khách (guest) sử dụng
     * 
     * Hệ thống sẽ:
     * 1. Lấy context từ khóa học (RAG)
     *    - Guest: chỉ lấy thông tin khóa học công khai
     *    - Authenticated: lấy thông tin user + khóa học
     * 2. Gọi Google Gemini API
     * 3. Trả về câu trả lời
     */
    @PostMapping("/message")
    public ResponseEntity<ChatResponse> sendMessage(@Valid @RequestBody ChatRequest request) {
        System.out.println("========================================");
        System.out.println("Chat Request received");
        System.out.println("Message: " + request.getMessage());
        System.out.println("Course ID: " + request.getCourseId());
        System.out.println("========================================");
        
        try {
            String response = chatService.chat(request.getMessage(), request.getCourseId());
            
            ChatResponse chatResponse = new ChatResponse();
            chatResponse.setResponse(response);
            chatResponse.setMessage(response); // Backward compatibility
            chatResponse.setCourseId(request.getCourseId());
            
            return ResponseEntity.ok(chatResponse);
        } catch (Exception e) {
            System.err.println("Error in chat endpoint: " + e.getMessage());
            e.printStackTrace();
            
            ChatResponse errorResponse = new ChatResponse();
            errorResponse.setResponse("Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.");
            errorResponse.setMessage(errorResponse.getResponse());
            
            return ResponseEntity.ok(errorResponse);
        }
    }

    /**
     * Lấy context cho chatbot AI (Legacy endpoint)
     * GET /api/v1/chat/context
     * 
     * Trả về thông tin học tập của user để chatbot có thể trả lời chính xác hơn
     */
    @GetMapping("/context")
    @PreAuthorize("isAuthenticated()")
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
     * GET /api/v1/chat/health
     */
    @GetMapping("/health")
    public ResponseEntity<MessageResponse> health() {
        return ResponseEntity.ok(new MessageResponse("Chat service is running"));
    }
}

