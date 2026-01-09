package com.coursemgmt.controller;

import com.coursemgmt.dto.*;
import com.coursemgmt.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthService authService;

    // Đăng nhập người dùng
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        // @Valid → Validate dữ liệu đầu vào, @RequestBody → Convert JSON → Java Object
        JwtResponse jwtResponse = authService.loginUser(loginRequest); // Gọi service xử lý đăng nhập → Trả về JWT token
        return ResponseEntity.ok(jwtResponse); // Trả về 200 OK với JWT token
    }

    // Đăng ký người dùng mới
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            authService.registerUser(registerRequest); // Gọi service tạo user mới
            return ResponseEntity.ok(new MessageResponse("User registered successfully!")); // Thành công → 200 OK
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage())); // Lỗi → 400 Bad Request
        }
    }

    // Quên mật khẩu
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request, HttpServletRequest servletRequest) {
        try {
            authService.handleForgotPassword(request, servletRequest); // Tạo token reset → Gửi email
            return ResponseEntity.ok(new MessageResponse("Password reset link sent to your email!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // Đặt lại mật khẩu
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            authService.handleResetPassword(request);
            return ResponseEntity.ok(new MessageResponse("Password reset successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}