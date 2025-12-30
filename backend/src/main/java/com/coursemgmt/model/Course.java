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

    private String imageUrl;

    private Integer totalDurationInHours;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private ECourseStatus status; // Enum: DRAFT, PENDING_APPROVAL, PUBLISHED

    @Column(name = "is_featured")
    private Boolean isFeatured = false; // Khóa học nổi bật (được chọn thủ công)

    @Column(name = "is_published")
    private Boolean isPublished = true; // Khóa học đã được publish

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

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