package com.coursemgmt.controller;

import com.coursemgmt.dto.ChangePasswordRequest;
import com.coursemgmt.dto.MessageResponse;
import com.coursemgmt.dto.ProfileResponse;
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

    // Get current user profile
    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getProfile() {
        try {
            // Get current authenticated user ID
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || authentication.getPrincipal() == null) {
                return ResponseEntity.status(401).body(new MessageResponse("Chưa đăng nhập"));
            }

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long currentUserId = userDetails.getId();

            if (currentUserId == null) {
                return ResponseEntity.status(401).body(new MessageResponse("Không thể xác định người dùng"));
            }

            // CRITICAL: Fetch fresh data from database and map to DTO to avoid Jackson infinite recursion
            ProfileResponse profileResponse = authService.getUserProfile(currentUserId);

            return ResponseEntity.ok(profileResponse);

        } catch (Exception e) {
            System.out.println("GetProfile: Error - " + e.getClass().getName() + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new MessageResponse("Lỗi hệ thống: " + e.getMessage()));
        }
    }

    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()") // Đảm bảo chỉ người đã đăng nhập mới được gọi
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || authentication.getPrincipal() == null) {
                return ResponseEntity.status(401).body(new MessageResponse("Chưa đăng nhập"));
            }

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long currentUserId = userDetails.getId();

            if (currentUserId == null) {
                return ResponseEntity.status(401).body(new MessageResponse("Không thể xác định người dùng"));
            }

            // Validate request
            if (request == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("Request không hợp lệ"));
            }

            // Call service to update and persist to database
            authService.updateProfile(currentUserId, request);
            return ResponseEntity.ok(new MessageResponse("Cập nhật hồ sơ thành công"));

        } catch (IllegalArgumentException e) {
            // Validation errors
            System.out.println("UpdateProfile: IllegalArgumentException - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        } catch (RuntimeException e) {
            // Business logic errors
            System.out.println("UpdateProfile: RuntimeException - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            // Unexpected errors - Log the real error to console
            System.out.println("UpdateProfile: Unexpected error - " + e.getClass().getName() + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new MessageResponse("Lỗi hệ thống: " + e.getMessage()));
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

    // Endpoint for changing password
    @PutMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || authentication.getPrincipal() == null) {
                System.out.println("ChangePassword: Authentication is null");
                return ResponseEntity.status(401).body(new MessageResponse("Chưa đăng nhập"));
            }

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long currentUserId = userDetails.getId();

            if (currentUserId == null) {
                System.out.println("ChangePassword: User ID is null");
                return ResponseEntity.status(401).body(new MessageResponse("Không thể xác định người dùng"));
            }

            System.out.println("ChangePassword: Processing request for user ID: " + currentUserId);

            // Validate request
            if (request == null) {
                System.out.println("ChangePassword: Request body is null");
                return ResponseEntity.badRequest().body(new MessageResponse("Request không hợp lệ"));
            }

            // Call service
            authService.changePassword(currentUserId, request);
            return ResponseEntity.ok(new MessageResponse("Đổi mật khẩu thành công"));

        } catch (IllegalArgumentException e) {
            // Return 400 Bad Request for wrong password/validation errors, so frontend can show the red alert
            System.out.println("ChangePassword: IllegalArgumentException - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        } catch (RuntimeException e) {
            // Other runtime exceptions
            System.out.println("ChangePassword: RuntimeException - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            // Unexpected errors (NullPointerException, etc.) - Log the real error to console
            System.out.println("ChangePassword: Unexpected error - " + e.getClass().getName() + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new MessageResponse("Lỗi hệ thống: " + e.getMessage()));
        }
    }
}