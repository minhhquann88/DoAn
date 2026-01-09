package com.coursemgmt.controller;

import com.coursemgmt.dto.CourseRequest;
import com.coursemgmt.dto.CourseResponse;
import com.coursemgmt.dto.CourseStatisticsResponse;
import com.coursemgmt.dto.MessageResponse;
import com.coursemgmt.dto.ChapterResponse;
import com.coursemgmt.dto.LessonResponse;
import com.coursemgmt.model.Course;
import com.coursemgmt.repository.CourseRepository;
import com.coursemgmt.security.services.UserDetailsImpl;
import com.coursemgmt.service.CourseService;
import com.coursemgmt.service.ContentService;
import com.coursemgmt.service.FileStorageService;
import com.coursemgmt.service.MeetingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/courses")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private CourseRepository courseRepository;


    private static final Set<String> VALID_SORT_FIELDS = new HashSet<>(Arrays.asList(
            "id", "title", "description", "price", "imageUrl", "totalDurationInHours",
            "status", "createdAt", "updatedAt"
    ));

    // Sanitize sort parameter để tránh lỗi 400 từ tên field không hợp lệ
    private String sanitizeSort(String sort) {
        if (sort == null || sort.isEmpty()) {
            return "createdAt,desc";
        }

        String[] parts = sort.split(",");
        String fieldName = parts[0].trim();
        String direction = parts.length > 1 ? parts[1].trim() : "desc";

        if (!VALID_SORT_FIELDS.contains(fieldName)) {
            return "createdAt," + direction;
        }

        return fieldName + "," + direction;
    }

    // Tạo khóa học mới
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('LECTURER')")
    public ResponseEntity<CourseResponse> createCourse(@Valid @RequestBody CourseRequest request,
                                                       @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Course course = courseService.createCourse(request, userDetails);
        return ResponseEntity.ok(CourseResponse.fromEntity(course));
    }

    // Cập nhật khóa học
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @courseSecurityService.isInstructor(authentication, #id)")
    public ResponseEntity<CourseResponse> updateCourse(@PathVariable Long id,
                                                       @Valid @RequestBody CourseRequest request) {
        Course updatedCourse = courseService.updateCourse(id, request);
        return ResponseEntity.ok(CourseResponse.fromEntity(updatedCourse));
    }

    // Upload ảnh bìa khóa học
    @PostMapping(value = "/{id}/image", consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('ADMIN') or @courseSecurityService.isInstructor(authentication, #id)")
    public ResponseEntity<?> uploadCourseImage(@PathVariable Long id,
                                                @RequestParam("file") MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("File is required and cannot be empty"));
            }
            
            CourseResponse courseResponse = courseService.getCourseById(id);
            String imageUrl = fileStorageService.storeCourseImage(file, id);
            Course currentCourse = courseRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Course not found!"));
            
            CourseRequest updateRequest = new CourseRequest();
            updateRequest.setTitle(currentCourse.getTitle());
            updateRequest.setDescription(currentCourse.getDescription());
            updateRequest.setPrice(currentCourse.getPrice());
            if (currentCourse.getCategory() != null && currentCourse.getCategory().getId() != null) {
                updateRequest.setCategoryId(currentCourse.getCategory().getId());
            } else {
                throw new RuntimeException("Course category is missing!");
            }
            updateRequest.setImageUrl(imageUrl);
            if (currentCourse.getTotalDurationInHours() != null) {
                updateRequest.setTotalDurationInHours(currentCourse.getTotalDurationInHours());
            }
            
            Course updatedCourse = courseService.updateCourse(id, updateRequest);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Course image uploaded successfully");
            response.put("imageUrl", imageUrl);
            response.put("course", CourseResponse.fromEntity(updatedCourse));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error uploading course image: " + e.getMessage()));
        }
    }

    // Xóa khóa học
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LECTURER')")
    public ResponseEntity<MessageResponse> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok(new MessageResponse("Course deleted successfully!"));
    }

    @Autowired
    private ContentService contentService;

    // Lấy chi tiết 1 khóa học (Public)
    @GetMapping("/{id}")
    public ResponseEntity<CourseResponse> getCourseById(@PathVariable Long id) {
        CourseResponse course = courseService.getCourseById(id);
        return ResponseEntity.ok(course);
    }

    // Lấy curriculum công khai (chỉ tên chapters và lessons, không có nội dung chi tiết)
    @GetMapping("/{id}/curriculum")
    public ResponseEntity<List<ChapterResponse>> getPublicCurriculum(@PathVariable Long id) {
        LessonResponse previewLesson = contentService.getPreviewLesson(id);
        Long previewLessonId = (previewLesson != null) ? previewLesson.getId() : null;
        
        List<ChapterResponse> curriculum = contentService.getPublicCurriculum(id, previewLessonId);
        return ResponseEntity.ok(curriculum);
    }

    // Lấy danh sách khóa học nổi bật (Featured Courses - Public)
    @GetMapping("/featured")
    public ResponseEntity<List<CourseResponse>> getFeaturedCourses() {
        List<CourseResponse> featuredCourses = courseService.getFeaturedCourses();
        return ResponseEntity.ok(featuredCourses);
    }

    // Tìm kiếm, lọc, sắp xếp khóa học (Public)
    @GetMapping
    public ResponseEntity<Page<CourseResponse>> getAllCourses(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Boolean isFree,
            @RequestParam(required = false) Boolean isPaid,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) Double minRating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        String sanitizedSort = sanitizeSort(sort);
        Page<CourseResponse> courses = courseService.getAllPublishedCourses(keyword, categoryId, minPrice, maxPrice, isFree, isPaid, level, minRating, page, size, sanitizedSort);
        return ResponseEntity.ok(courses);
    }

    // Thống kê (Admin hoặc Giảng viên sở hữu)
    @GetMapping("/{id}/statistics")
    @PreAuthorize("hasRole('ADMIN') or @courseSecurityService.isInstructor(authentication, #id)")
    public ResponseEntity<CourseStatisticsResponse> getCourseStatistics(@PathVariable Long id) {
        CourseStatisticsResponse stats = courseService.getCourseStatistics(id);
        return ResponseEntity.ok(stats);
    }

    // Giảng viên tự publish khóa học
    @PostMapping("/{id}/publish")
    @PreAuthorize("hasRole('LECTURER') or hasRole('ADMIN')")
    public ResponseEntity<CourseResponse> publishCourse(@PathVariable Long id,
                                                         @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Course publishedCourse = courseService.publishCourse(id, userDetails);
        return ResponseEntity.ok(CourseResponse.fromEntity(publishedCourse));
    }

    // Giảng viên gỡ khóa học (Unpublish) - PUBLISHED -> DRAFT
    @PostMapping("/{id}/unpublish")
    @PreAuthorize("hasRole('LECTURER') or hasRole('ADMIN')")
    public ResponseEntity<CourseResponse> unpublishCourse(@PathVariable Long id,
                                                           @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Course unpublishedCourse = courseService.unpublishCourse(id, userDetails);
        return ResponseEntity.ok(CourseResponse.fromEntity(unpublishedCourse));
    }

    // Lấy danh sách khóa học của học viên (My Courses)
    @GetMapping("/my-courses")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<CourseResponse>> getMyCourses(
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        List<CourseResponse> courses = courseService.getMyCourses(userDetails.getId());
        return ResponseEntity.ok(courses);
    }
}