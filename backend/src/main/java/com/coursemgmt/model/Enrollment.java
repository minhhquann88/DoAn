package com.coursemgmt.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "enrollments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"certificate", "progresses", "user", "course"})
@EqualsAndHashCode(exclude = {"certificate", "progresses", "user", "course"})
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime enrolledAt;

    private Double progress = 0.0; // Mặc định là 0%

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private EEnrollmentStatus status; // Enum: IN_PROGRESS, COMPLETED

    // (n-1) Nhiều Ghi danh thuộc 1 User
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // (n-1) Nhiều Ghi danh thuộc 1 Course
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    // (1-1) 1 Ghi danh có 1 Chứng chỉ
    @OneToOne(mappedBy = "enrollment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Certificate certificate;

    // (1-n) 1 Ghi danh có nhiều Tiến độ bài học
    @OneToMany(mappedBy = "enrollment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<User_Progress> progresses;
}