package com.coursemgmt.controller;

import com.coursemgmt.dto.*;
import com.coursemgmt.dto.ChatMessageResponse;
import com.coursemgmt.security.services.UserDetailsImpl;
import com.coursemgmt.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class ChatController {
    
    private final ChatService chatService;
    
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
            return ((UserDetailsImpl) authentication.getPrincipal()).getId();
        }
        throw new RuntimeException("User not authenticated");
    }
    
    @PostMapping("/conversations")
    public ResponseEntity<ConversationResponse> createConversation(@Valid @RequestBody CreateConversationRequest request) {
        Long currentUserId = getCurrentUserId();
        ConversationResponse conversation = chatService.createConversation(currentUserId, request);
        return ResponseEntity.ok(conversation);
    }
    
    @GetMapping("/conversations")
    public ResponseEntity<java.util.List<ConversationResponse>> getUserConversations() {
        Long currentUserId = getCurrentUserId();
        return ResponseEntity.ok(chatService.getUserConversations(currentUserId));
    }
    
    @GetMapping("/conversations/{id}")
    public ResponseEntity<ConversationResponse> getConversation(@PathVariable Long id) {
        Long currentUserId = getCurrentUserId();
        return ResponseEntity.ok(chatService.getConversation(id, currentUserId));
    }
    
    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<Page<ChatMessageResponse>> getMessages(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Long currentUserId = getCurrentUserId();
        return ResponseEntity.ok(chatService.getMessages(id, currentUserId, page, size));
    }
    
    @PostMapping("/messages")
    public ResponseEntity<ChatMessageResponse> sendMessage(@Valid @RequestBody SendMessageRequest request) {
        Long currentUserId = getCurrentUserId();
        return ResponseEntity.ok(chatService.sendMessage(currentUserId, request));
    }
    
    @PutMapping("/messages/{id}")
    public ResponseEntity<ChatMessageResponse> updateMessage(
            @PathVariable Long id,
            @Valid @RequestBody UpdateMessageRequest request) {
        Long currentUserId = getCurrentUserId();
        return ResponseEntity.ok(chatService.updateMessage(id, currentUserId, request));
    }
    
    @DeleteMapping("/messages/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long id) {
        Long currentUserId = getCurrentUserId();
        chatService.deleteMessage(id, currentUserId);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/conversations/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        Long currentUserId = getCurrentUserId();
        chatService.markAsRead(id, currentUserId);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/conversations/{id}/unread-count")
    public ResponseEntity<Long> getUnreadCount(@PathVariable Long id) {
        Long currentUserId = getCurrentUserId();
        return ResponseEntity.ok(chatService.getUnreadCount(id, currentUserId));
    }
    
    /**
     * GET /api/v1/chat/instructors
     * Lấy danh sách giảng viên từ các khóa học đã đăng ký (cho student)
     */
    @GetMapping("/instructors")
    public ResponseEntity<java.util.List<com.coursemgmt.dto.InstructorInfoDTO>> getEnrolledInstructors() {
        Long currentUserId = getCurrentUserId();
        return ResponseEntity.ok(chatService.getEnrolledInstructors(currentUserId));
    }
}
