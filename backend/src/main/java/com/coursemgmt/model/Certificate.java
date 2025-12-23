package com.coursemgmt.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "certificates")
@Data
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "certificate_code", unique = true, nullable = false)
    private String certificateCode; // Mã chứng chỉ

    @Column(name = "pdf_url")
    private String pdfUrl; // Đường dẫn PDF

    @Column(name = "issued_at")
    private LocalDateTime issuedAt; // Ngày cấp
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // (1-1) Nối với Enrollment
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", nullable = false, unique = true)
    private Enrollment enrollment;
}