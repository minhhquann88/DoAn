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
    @Email
    private String email;

    private String avatarUrl;

    private String bio;
}