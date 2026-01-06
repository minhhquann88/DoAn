package com.coursemgmt.controller;

import com.coursemgmt.dto.LessonResponse;
import com.coursemgmt.dto.MessageResponse;
import com.coursemgmt.model.Lesson;
import com.coursemgmt.service.ContentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/manage/content") // API quản lý
public class ContentManagementController {

    @Autowired
    private ContentService contentService;

    // API để giảng viên preview bài học trước khi publish
    @GetMapping("/lessons/{lessonId}/preview")
    @PreAuthorize("hasRole('ADMIN') or @courseSecurityService.isInstructorOfLesson(authentication, #lessonId)")
    public ResponseEntity<?> previewLesson(@PathVariable Long lessonId) {
        try {
            Lesson lesson = contentService.getLessonById(lessonId);
            return ResponseEntity.ok(LessonResponse.fromEntity(lesson, false));
        } catch (RuntimeException e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Lesson not found: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error previewing lesson: " + e.getMessage()));
        }
    }
}