package com.coursemgmt.controller;

import com.coursemgmt.dto.ChapterResponse;
import com.coursemgmt.dto.LessonProgressRequest;
import com.coursemgmt.dto.MessageResponse;
import com.coursemgmt.security.services.CourseSecurityService;
import com.coursemgmt.security.services.UserDetailsImpl;
import com.coursemgmt.service.ContentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/content") // API truy cập nội dung
public class ContentAccessController {

    @Autowired
    private ContentService contentService;


    // API để Học viên (đã đăng ký) hoặc Giảng viên xem toàn bộ nội dung khóa học
    @GetMapping("/courses/{courseId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ChapterResponse>> getCourseContent(@PathVariable Long courseId,
                                                                  @AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<ChapterResponse> content = contentService.getCourseContent(courseId, userDetails);
        return ResponseEntity.ok(content);
    }

    // API để Học viên đánh dấu "Đã hoàn thành"
    @PostMapping("/lessons/{lessonId}/complete")
    @PreAuthorize("hasRole('STUDENT') and @courseSecurityService.isEnrolled(authentication, #lessonId)")
    public ResponseEntity<MessageResponse> markLessonAsCompleted(@PathVariable Long lessonId,
                                                                 @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            contentService.markLessonAsCompleted(lessonId, userDetails);
            return ResponseEntity.ok(new MessageResponse("Lesson marked as completed!"));
        } catch (Exception e) {
            System.err.println("ERROR in markLessonAsCompleted: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    // API để cập nhật tiến độ xem video (Auto-Progress: Auto-complete khi >90%)
    @PostMapping("/lessons/{lessonId}/progress")
    @PreAuthorize("hasRole('STUDENT') and @courseSecurityService.isEnrolled(authentication, #lessonId)")
    public ResponseEntity<MessageResponse> updateLessonProgress(@PathVariable Long lessonId,
                                                               @Valid @RequestBody LessonProgressRequest request,
                                                               @AuthenticationPrincipal UserDetailsImpl userDetails) {
        contentService.updateLessonWatchTime(lessonId, request.getWatchedTime(), request.getTotalDuration(), userDetails);
        return ResponseEntity.ok(new MessageResponse("Progress updated successfully!"));
    }

    // API public để lấy preview lesson đầu tiên của khóa học (cho trang chi tiết)
    // Không cần authentication - cho phép mọi người xem preview
    @GetMapping("/courses/{courseId}/preview")
    public ResponseEntity<com.coursemgmt.dto.LessonResponse> getPreviewLesson(@PathVariable Long courseId) {
        com.coursemgmt.dto.LessonResponse previewLesson = contentService.getPreviewLesson(courseId);
        if (previewLesson == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(previewLesson);
    }
}