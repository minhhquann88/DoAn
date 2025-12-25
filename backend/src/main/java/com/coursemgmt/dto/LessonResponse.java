package com.coursemgmt.dto;

import com.coursemgmt.model.EContentType;
import com.coursemgmt.model.Lesson;
import lombok.Data;

@Data
public class LessonResponse {
    private Long id;
    private String title;
    private EContentType contentType;
    private String videoUrl;
    private String documentUrl;
    private String content;
    private Integer durationInMinutes;
    private Integer position;

    // Dùng cho chức năng "Theo dõi tiến độ"
    private boolean isCompleted;

    public static LessonResponse fromEntity(Lesson lesson, boolean isCompleted) {
        LessonResponse dto = new LessonResponse();
        dto.setId(lesson.getId());
        dto.setTitle(lesson.getTitle());
        dto.setContentType(lesson.getContentType());
        dto.setDurationInMinutes(lesson.getDurationInMinutes());
        dto.setPosition(lesson.getPosition());
        dto.setCompleted(isCompleted);

        // Chỉ trả về nội dung chi tiết nếu đã hoàn thành (hoặc là Giảng viên)
        // (Đây là logic ví dụ, bạn có thể quyết định trả về hết)
        if (isCompleted) {
            dto.setVideoUrl(lesson.getVideoUrl());
            dto.setDocumentUrl(lesson.getDocumentUrl());
            dto.setContent(lesson.getContent());
        }

        return dto;
    }
}