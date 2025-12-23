package com.coursemgmt.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "courses")
@Data
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Lob // Dùng @Lob thay cho columnDefinition
    private String description;

    @Column(nullable = false)
    private Double price;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "total_duration_in_hours")
    private Integer totalDurationInHours;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private ECourseStatus status; // Enum: DRAFT, PENDING_APPROVAL, PUBLISHED

    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    
    // Denormalized stats fields
    @Column(name = "total_enrollments")
    private Integer totalEnrollments = 0;
    
    @Column(name = "total_lessons")
    private Integer totalLessons = 0;
    
    @Column(name = "average_rating")
    private Double averageRating = 0.0;
    
    @Column(name = "total_reviews")
    private Integer totalReviews = 0;

    // (n-1) Nhiều Course thuộc 1 Giảng viên (User)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id")
    private User instructor;

    // (n-1) Nhiều Course thuộc 1 Category
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    // (1-n) 1 Course có nhiều Chapter
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC") // Sắp xếp chương theo thứ tự
    private List<Chapter> chapters;

    // (1-n) 1 Course có nhiều lượt Ghi danh
    @OneToMany(mappedBy = "course")
    private List<Enrollment> enrollments;

    // (1-n) 1 Course có nhiều Giao dịch
    @OneToMany(mappedBy = "course")
    private List<Transaction> transactions;
}