package com.coursemgmt.controller;

import com.coursemgmt.dto.CourseRequest;
import com.coursemgmt.dto.CourseResponse;
import com.coursemgmt.dto.CourseStatisticsResponse;
import com.coursemgmt.dto.MessageResponse;
import com.coursemgmt.dto.ChapterResponse;
import com.coursemgmt.model.Course;
import com.coursemgmt.security.services.UserDetailsImpl;
import com.coursemgmt.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/courses")
public class CourseController {

    @Autowired
    private CourseService courseService;

    // Valid sort fields for Course entity
    private static final Set<String> VALID_SORT_FIELDS = new HashSet<>(Arrays.asList(
            "id", "title", "description", "price", "imageUrl", "totalDurationInHours",
            "status", "createdAt", "updatedAt"
    ));

    /**
     * Sanitize sort parameter to prevent 400 errors from invalid field names
     * @param sort Original sort string (e.g., "enrollmentCount,desc")
     * @return Sanitized sort string with valid field name (e.g., "createdAt,desc")
     */
    private String sanitizeSort(String sort) {
        if (sort == null || sort.isEmpty()) {
            return "createdAt,desc";
        }

        String[] parts = sort.split(",");
        String fieldName = parts[0].trim();
        String direction = parts.length > 1 ? parts[1].trim() : "desc";

        // Check if field name is valid
        if (!VALID_SORT_FIELDS.contains(fieldName)) {
            // Replace invalid field with default (createdAt)
            return "createdAt," + direction;
        }

        return fieldName + "," + direction;
    }

    // 1. Tạo khóa học (Admin, Giảng viên)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('LECTURER')")
    public ResponseEntity<CourseResponse> createCourse(@Valid @RequestBody CourseRequest request,
                                                       @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Course course = courseService.createCourse(request, userDetails);
        return ResponseEntity.ok(CourseResponse.fromEntity(course));
    }

    // 2. Cập nhật khóa học (Admin hoặc Giảng viên sở hữu)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @courseSecurityService.isInstructor(authentication, #id)")
    public ResponseEntity<CourseResponse> updateCourse(@PathVariable Long id,
                                                       @Valid @RequestBody CourseRequest request) {
        Course updatedCourse = courseService.updateCourse(id, request);
        return ResponseEntity.ok(CourseResponse.fromEntity(updatedCourse));
    }

    // 3. Xóa khóa học (Admin hoặc Giảng viên sở hữu)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @courseSecurityService.isInstructor(authentication, #id)")
    public ResponseEntity<MessageResponse> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok(new MessageResponse("Course deleted successfully!"));
    }

    // 4. Duyệt khóa học (Admin)
    @PatchMapping("/{id}/approve") // Dùng PATCH vì chỉ cập nhật 1 phần (status)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CourseResponse> approveCourse(@PathVariable Long id) {
        Course approvedCourse = courseService.approveCourse(id);
        return ResponseEntity.ok(CourseResponse.fromEntity(approvedCourse));
    }

    // 5. Lấy chi tiết 1 khóa học (Public)
    @GetMapping("/{id}")
    public ResponseEntity<CourseResponse> getCourseById(@PathVariable Long id) {
        CourseResponse course = courseService.getCourseById(id);
        return ResponseEntity.ok(course);
    }

    // 5.1. Lấy preview curriculum (Public - for guests to see course structure)
    @GetMapping("/{id}/preview")
    public ResponseEntity<List<ChapterResponse>> getCoursePreview(@PathVariable Long id) {
        List<ChapterResponse> preview = courseService.getCoursePreview(id);
        return ResponseEntity.ok(preview);
    }

    // 5.2. Lấy danh sách khóa học nổi bật (Featured Courses - Public)
    @GetMapping("/featured")
    public ResponseEntity<List<CourseResponse>> getFeaturedCourses() {
        List<CourseResponse> featuredCourses = courseService.getFeaturedCourses();
        return ResponseEntity.ok(featuredCourses);
    }

    // 6. Tìm kiếm, lọc, sắp xếp khóa học (Public)
    @GetMapping
    public ResponseEntity<Page<CourseResponse>> getAllCourses(
            @RequestParam(required = false) String keyword, // Từ khóa tìm kiếm
            @RequestParam(required = false) Long categoryId, // Lọc theo danh mục
            @RequestParam(required = false) Double minPrice, // Giá tối thiểu
            @RequestParam(required = false) Double maxPrice, // Giá tối đa
            @RequestParam(required = false) Boolean isFree, // Lọc khóa học miễn phí
            @RequestParam(required = false) Boolean isPaid, // Lọc khóa học có phí
            @RequestParam(required = false) String level, // Lọc theo cấp độ (BEGINNER, INTERMEDIATE, ADVANCED, EXPERT)
            @RequestParam(required = false) Double minRating, // Đánh giá tối thiểu
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort // Sắp xếp
    ) {
        // Sanitize sort parameter to prevent 400 errors from invalid field names
        String sanitizedSort = sanitizeSort(sort);
        Page<CourseResponse> courses = courseService.getAllPublishedCourses(keyword, categoryId, minPrice, maxPrice, isFree, isPaid, level, minRating, page, size, sanitizedSort);
        return ResponseEntity.ok(courses);
    }

    // 7. Thống kê (Admin hoặc Giảng viên sở hữu)
    @GetMapping("/{id}/statistics")
    @PreAuthorize("hasRole('ADMIN') or @courseSecurityService.isInstructor(authentication, #id)")
    public ResponseEntity<CourseStatisticsResponse> getCourseStatistics(@PathVariable Long id) {
        CourseStatisticsResponse stats = courseService.getCourseStatistics(id);
        return ResponseEntity.ok(stats);
    }

    // 8. Giảng viên gửi yêu cầu phê duyệt khóa học
    @PostMapping("/{id}/request-approval")
    @PreAuthorize("hasRole('LECTURER') and @courseSecurityService.isInstructor(authentication, #id)")
    public ResponseEntity<CourseResponse> requestCourseApproval(@PathVariable Long id,
                                                                @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Course approvedCourse = courseService.requestApproval(id, userDetails);
        return ResponseEntity.ok(CourseResponse.fromEntity(approvedCourse));
    }

    // 9. Giảng viên tự publish khóa học (Marketplace Model - Self-Publish)
    @PostMapping("/{id}/publish")
    @PreAuthorize("hasRole('LECTURER') or hasRole('ADMIN')")
    public ResponseEntity<CourseResponse> publishCourse(@PathVariable Long id,
                                                         @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Course publishedCourse = courseService.publishCourse(id, userDetails);
        return ResponseEntity.ok(CourseResponse.fromEntity(publishedCourse));
    }

    // 10. Đánh dấu khóa học là nổi bật (Featured) - Chỉ Admin
    @PatchMapping("/{id}/feature")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CourseResponse> toggleFeatured(@PathVariable Long id,
                                                          @RequestParam(defaultValue = "true") Boolean isFeatured) {
        Course course = courseService.toggleFeatured(id, isFeatured);
        return ResponseEntity.ok(CourseResponse.fromEntity(course));
    }
}