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
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    AuthService authService;

    @Autowired
    FileStorageService fileStorageService;

    // Lấy thông tin profile người dùng hiện tại
    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()") // Chỉ cho phép user đã đăng nhập
    public ResponseEntity<?> getProfile() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication(); // Lấy Authentication từ SecurityContext (đã set bởi JWT Filter)
            if (authentication == null || authentication.getPrincipal() == null) {
                return ResponseEntity.status(401).body(new MessageResponse("Chưa đăng nhập"));
            }

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal(); // Lấy UserDetails từ Authentication
            Long currentUserId = userDetails.getId(); // Lấy ID của user hiện tại

            if (currentUserId == null) {
                return ResponseEntity.status(401).body(new MessageResponse("Không thể xác định người dùng"));
            }

            ProfileResponse profileResponse = authService.getUserProfile(currentUserId); // Lấy thông tin profile từ database
            return ResponseEntity.ok(profileResponse);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(new MessageResponse("Lỗi hệ thống: " + e.getMessage()));
        }
    }

    // Cập nhật thông tin profile
    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()") // Chỉ cho phép user đã đăng nhập
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication(); // Lấy Authentication từ SecurityContext
            if (authentication == null || authentication.getPrincipal() == null) {
                return ResponseEntity.status(401).body(new MessageResponse("Chưa đăng nhập"));
            }

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal(); // Lấy UserDetails
            Long currentUserId = userDetails.getId(); // Lấy ID user hiện tại

            if (currentUserId == null) {
                return ResponseEntity.status(401).body(new MessageResponse("Không thể xác định người dùng"));
            }

            if (request == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("Request không hợp lệ"));
            }

            authService.updateProfile(currentUserId, request); // Cập nhật profile (Partial Update: chỉ update field có giá trị)
            return ResponseEntity.ok(new MessageResponse("Cập nhật hồ sơ thành công"));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new MessageResponse("Lỗi hệ thống: " + e.getMessage()));
        }
    }

    // Upload avatar
    @PostMapping("/avatar")
    @PreAuthorize("isAuthenticated()") // Chỉ cho phép user đã đăng nhập
    public ResponseEntity<?> uploadAvatar(@RequestParam("file") MultipartFile file) { // @RequestParam → Nhận file từ form-data
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long currentUserId = userDetails.getId();

        try {
            String avatarUrl = fileStorageService.storeAvatar(file, currentUserId); // Lưu file vào thư mục uploads → Trả về URL
            User updatedUser = authService.updateAvatarUrl(currentUserId, avatarUrl); // Cập nhật avatarUrl vào database
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Avatar uploaded successfully");
            response.put("avatarUrl", avatarUrl);
            response.put("user", updatedUser);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error uploading avatar: " + e.getMessage()));
        }
    }

    // Đổi mật khẩu
    @PutMapping("/change-password")
    @PreAuthorize("isAuthenticated()") // Chỉ cho phép user đã đăng nhập
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || authentication.getPrincipal() == null) {
                return ResponseEntity.status(401).body(new MessageResponse("Chưa đăng nhập"));
            }

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long currentUserId = userDetails.getId(); // Lấy ID user hiện tại

            if (currentUserId == null) {
                return ResponseEntity.status(401).body(new MessageResponse("Không thể xác định người dùng"));
            }

            if (request == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("Request không hợp lệ"));
            }

            authService.changePassword(currentUserId, request); // Verify old password → Encode new password → Save
            return ResponseEntity.ok(new MessageResponse("Đổi mật khẩu thành công"));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new MessageResponse("Lỗi hệ thống: " + e.getMessage()));
        }
    }
}