package com.coursemgmt.controller;

import com.coursemgmt.dto.MessageResponse;
import com.coursemgmt.dto.UpdateProfileRequest;
import com.coursemgmt.model.User;
import com.coursemgmt.security.services.UserDetailsImpl;
import com.coursemgmt.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/user") // API cho người dùng đã đăng nhập
public class UserController {

    @Autowired
    AuthService authService;

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
}