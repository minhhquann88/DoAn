package com.coursemgmt.controller;

import com.coursemgmt.security.services.UserDetailsImpl;
import com.coursemgmt.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/chat/files")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class ChatFileController {
    
    private final FileStorageService fileStorageService;
    
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
            return ((UserDetailsImpl) authentication.getPrincipal()).getId();
        }
        throw new RuntimeException("User not authenticated");
    }
    
    /**
     * Upload file for chat message (image or document)
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadChatFile(@RequestParam("file") MultipartFile file) {
        try {
            Long userId = getCurrentUserId();
            
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "File is empty"));
            }
            
            // Check file size (max 10MB for chat files)
            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("message", "File size exceeds 10MB limit"));
            }
            
            // Determine file type
            String contentType = file.getContentType();
            String originalFileName = file.getOriginalFilename();
            String fileUrl;
            String messageType;
            
            if (contentType != null && contentType.startsWith("image/")) {
                // Store as image - use avatar storage
                fileUrl = fileStorageService.storeAvatar(file, userId);
                messageType = "IMAGE";
            } else {
                // For documents, we'll store in a temporary location or reuse document storage
                // Since lesson document requires lessonId, we'll create a simple file storage method
                // For now, use avatar storage with a different naming convention
                try {
                    // Store document file (simplified - in production, create dedicated chat file storage)
                    fileUrl = fileStorageService.storeAvatar(file, userId); // Temporary solution
                    messageType = "FILE";
                } catch (Exception e) {
                    // If avatar storage fails (e.g., not an image), try document storage with placeholder
                    fileUrl = fileStorageService.storeLessonDocument(file, 0L);
                    messageType = "FILE";
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("fileUrl", fileUrl);
            response.put("fileName", originalFileName);
            response.put("fileSize", file.getSize());
            response.put("messageType", messageType);
            response.put("message", "File uploaded successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error uploading file: " + e.getMessage()));
        }
    }
}

