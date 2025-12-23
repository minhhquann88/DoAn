package com.coursemgmt.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "roles")
@Data
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Sử dụng @Enumerated để lưu tên của Enum (ADMIN, LECTURER, STUDENT)
    @Enumerated(EnumType.STRING)
    @Column(length = 20, unique = true, nullable = false)
    private ERole name;
    
    private String description;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}