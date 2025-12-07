package com.coursemgmt.dto;

import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request để update thông tin giảng viên
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InstructorUpdateRequest {
    private String fullName;
    private String phone;
    private String bio;
    private String expertise;
    private String profileImage;
    
    @Pattern(regexp = "ACTIVE|INACTIVE|SUSPENDED", message = "Status must be ACTIVE, INACTIVE, or SUSPENDED")
    private String accountStatus; // ACTIVE, INACTIVE, SUSPENDED
}

