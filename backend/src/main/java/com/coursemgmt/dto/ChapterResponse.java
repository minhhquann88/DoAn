package com.coursemgmt.dto;

import com.coursemgmt.model.Chapter;
import lombok.Data;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class ChapterResponse {
    private Long id;
    private String title;
    private Integer position;
    private List<LessonResponse> lessons;

    public static ChapterResponse fromEntity(Chapter chapter, List<LessonResponse> lessonResponses) {
        ChapterResponse dto = new ChapterResponse();
        dto.setId(chapter.getId());
        dto.setTitle(chapter.getTitle());
        dto.setPosition(chapter.getPosition());
        dto.setLessons(lessonResponses);
        return dto;
    }
}