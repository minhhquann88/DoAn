package com.coursemgmt.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.Set;

@Data
public class RegisterRequest {
    @NotBlank
    @Size(min = 3, max = 20)
    private String username;

    @NotBlank
    @Size(max = 50)
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 40, message = "Password must be between 6 and 40 characters")
    @Pattern(
        regexp = "^(?=.*[0-9])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]).{6,}$",
        message = "Password must be at least 6 characters long and contain at least one number and one special character"
    )
    private String password;

    @NotBlank
    private String fullName;

    // Khi đăng ký, client gửi lên set String ("student", "admin", "lecturer")
    private Set<String> roles;
}