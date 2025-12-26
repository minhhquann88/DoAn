package com.coursemgmt.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    // Đây là các trường bạn yêu cầu
    @Size(min = 1, max = 100)
    private String fullName;

    @Size(max = 50)
    @Email(message = "Email should be valid")
    private String email;

    private String avatarUrl;

    @Size(max = 500, message = "Bio must not exceed 500 characters")
    // TODO: Implement XSS sanitization (since adding a full HTML sanitizer library might be too heavy right now)
    private String bio;
}