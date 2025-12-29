package com.coursemgmt.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request để tạo enrollment mới
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentCreateRequest {
    @NotNull(message = "Student ID is required")
    private Long studentId;
    
    @NotNull(message = "Course ID is required")
    private Long courseId;
    
    private Boolean isPaid; // Đã thanh toán chưa
    
    @Min(value = 0, message = "Paid amount must be >= 0")
    private Double paidAmount;
}

