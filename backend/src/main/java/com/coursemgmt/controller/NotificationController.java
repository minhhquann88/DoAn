package com.coursemgmt.controller;

import com.coursemgmt.dto.NotificationDTO;
import com.coursemgmt.security.services.UserDetailsImpl;
import com.coursemgmt.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    
    /**
     * Lấy danh sách thông báo của user
     * GET /api/notifications
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getNotifications(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<com.coursemgmt.model.Notification> notifications = 
                notificationService.getUserNotifications(userDetails.getId(), pageable);
        
        Page<NotificationDTO> notificationDTOs = notifications.map(NotificationDTO::fromEntity);
        
        // Convert Page to Map để frontend dễ xử lý
        Map<String, Object> response = new HashMap<>();
        response.put("content", notificationDTOs.getContent());
        response.put("totalElements", notifications.getTotalElements());
        response.put("totalPages", notifications.getTotalPages());
        response.put("number", notifications.getNumber());
        response.put("size", notifications.getSize());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Đếm số thông báo chưa đọc
     * GET /api/notifications/unread-count
     */
    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        Long count = notificationService.getUnreadCount(userDetails.getId());
        return ResponseEntity.ok(Map.of("count", count));
    }
    
    /**
     * Đánh dấu thông báo là đã đọc
     * PATCH /api/notifications/{id}/read
     */
    @PatchMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        notificationService.markAsRead(id, userDetails.getId());
        return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
    }
    
    /**
     * Đánh dấu tất cả thông báo là đã đọc
     * PATCH /api/notifications/read-all
     */
    @PatchMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> markAllAsRead(
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        notificationService.markAllAsRead(userDetails.getId());
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }
}

