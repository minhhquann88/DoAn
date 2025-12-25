package com.coursemgmt.controller;

import com.coursemgmt.dto.CourseRequest;
import com.coursemgmt.dto.CourseResponse;
import com.coursemgmt.dto.CourseStatisticsResponse;
import com.coursemgmt.dto.MessageResponse;
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

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/courses")
public class CourseController {

    @Autowired
    private CourseService courseService;

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

    // 6. Tìm kiếm, lọc, sắp xếp khóa học (Public)
    @GetMapping
    public ResponseEntity<Page<CourseResponse>> getAllCourses(
            @RequestParam(required = false) String keyword, // Từ khóa tìm kiếm
            @RequestParam(required = false) Long categoryId, // Lọc theo danh mục
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort // Sắp xếp
    ) {
        Page<CourseResponse> courses = courseService.getAllPublishedCourses(keyword, categoryId, page, size, sort);
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
}