package com.coursemgmt.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "lessons")
@Data
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", length = 20)
    private EContentType contentType; // Enum: VIDEO, TEXT, DOCUMENT

    @Column(name = "video_url")
    private String videoUrl;

    @Column(name = "document_url")
    private String documentUrl;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String content;

    private Integer position; // Thứ tự bài học

    @Column(name = "duration_in_minutes")
    private Integer durationInMinutes;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // (n-1) Nhiều Lesson thuộc 1 Chapter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapter_id", nullable = false)
    private Chapter chapter;


    // (1-n) 1 Lesson có nhiều Tiến độ
    @OneToMany(mappedBy = "lesson")
    private List<User_Progress> progresses;
}