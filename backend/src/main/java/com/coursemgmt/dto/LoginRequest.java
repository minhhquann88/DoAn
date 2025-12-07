package com.coursemgmt.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank
    private String usernameOrEmail; // Cho phép đăng nhập bằng username hoặc email

    @NotBlank
    private String password;
}