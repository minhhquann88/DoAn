package com.coursemgmt.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "certificates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"enrollment"})
@EqualsAndHashCode(exclude = {"enrollment"})
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String certificateCode; // Mã chứng chỉ

    private String pdfUrl; // Đường dẫn PDF

    private LocalDateTime issuedAt; // Ngày cấp

    // (1-1) Nối với Enrollment
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", nullable = false, unique = true)
    private Enrollment enrollment;
}