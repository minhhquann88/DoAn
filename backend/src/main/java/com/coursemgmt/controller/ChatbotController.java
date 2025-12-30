package com.coursemgmt.controller;

import com.coursemgmt.dto.ChatRequest;
import com.coursemgmt.dto.ChatResponse;
import com.coursemgmt.security.services.UserDetailsImpl;
import com.coursemgmt.service.ChatbotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatbotController {
    
    private final ChatbotService chatbotService;
    
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
            return ((UserDetailsImpl) authentication.getPrincipal()).getId();
        }
        return null; // Allow guest users
    }
    
    /**
     * POST /api/v1/chat/message
     * Endpoint cho chatbot AI (Gemini)
     * Cho phép cả authenticated và guest users
     */
    @PostMapping("/message")
    public ResponseEntity<ChatResponse> sendChatMessage(@Valid @RequestBody ChatRequest request) {
        Long userId = getCurrentUserId();
        ChatResponse response = chatbotService.processMessage(request, userId);
        if (response.getResponse() == null && response.getMessage() != null) {
            response.setResponse(response.getMessage());
        }
        return ResponseEntity.ok(response);
    }
    
    /**
     * GET /api/v1/chat/health
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new java.util.HashMap<>();
        response.put("status", "ok");
        response.put("service", "chatbot");
        return ResponseEntity.ok(response);
    }
    
    /**
     * GET /api/v1/chat/context
     * Get chat context (for maintaining conversation)
     */
    @GetMapping("/context")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getChatContext(@RequestParam(required = false) Long userId) {
        Map<String, Object> context = new java.util.HashMap<>();
        context.put("userId", userId);
        context.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(context);
    }
}

