package com.coursemgmt.controller;

import com.coursemgmt.dto.MessageResponse;
import com.coursemgmt.dto.UpdateProfileRequest;
import com.coursemgmt.model.User;
import com.coursemgmt.security.services.UserDetailsImpl;
import com.coursemgmt.service.AuthService;
import com.coursemgmt.service.FileStorageService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/user") // API cho người dùng đã đăng nhập
public class UserController {

    @Autowired
    AuthService authService;

    @Autowired
    FileStorageService fileStorageService;

    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()") // Đảm bảo chỉ người đã đăng nhập mới được gọi
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        // Lấy thông tin user đang đăng nhập
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long currentUserId = userDetails.getId();

        try {
            User updatedUser = authService.updateProfile(currentUserId, request);
            return ResponseEntity.ok(updatedUser); // Trả về user đã cập nhật
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // New endpoint for avatar upload
    @PostMapping("/avatar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> uploadAvatar(@RequestParam("file") MultipartFile file) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long currentUserId = userDetails.getId();

        try {
            String avatarUrl = fileStorageService.storeAvatar(file, currentUserId);
            User updatedUser = authService.updateAvatarUrl(currentUserId, avatarUrl);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Avatar uploaded successfully");
            response.put("avatarUrl", avatarUrl);
            response.put("user", updatedUser);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error uploading avatar: " + e.getMessage()));
        }
    }
}