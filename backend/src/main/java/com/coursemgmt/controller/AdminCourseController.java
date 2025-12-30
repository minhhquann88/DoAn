package com.coursemgmt.controller;

import com.coursemgmt.dto.AdminUserDTO;
import com.coursemgmt.dto.CourseResponse;
import com.coursemgmt.model.Course;
import com.coursemgmt.model.ERole;
import com.coursemgmt.model.User;
import com.coursemgmt.repository.CourseRepository;
import com.coursemgmt.repository.UserRepository;
import com.coursemgmt.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/admin/courses")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCourseController {

    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private CourseService courseService;
    
    @Autowired
    private UserRepository userRepository;

    /**
     * GET /api/v1/admin/courses
     * Lấy tất cả khóa học với phân trang
     */
    @GetMapping
    public ResponseEntity<Page<CourseResponse>> getAllCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status
    ) {
        Sort.Direction direction = sortDir.equalsIgnoreCase("ASC") 
            ? Sort.Direction.ASC 
            : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        Page<Course> courses = courseService.getAllCoursesForAdmin(pageable, search, status);
        Page<CourseResponse> courseResponses = courses.map(CourseResponse::fromEntity);
        
        return ResponseEntity.ok(courseResponses);
    }

    /**
     * GET /api/v1/admin/courses/{id}
     * Lấy chi tiết khóa học
     */
    @GetMapping("/{id}")
    public ResponseEntity<CourseResponse> getCourseById(@PathVariable Long id) {
        return courseRepository.findById(id)
            .map(CourseResponse::fromEntity)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/v1/admin/courses/instructors
     * Lấy danh sách giảng viên để chuyển quyền sở hữu khóa học
     */
    @GetMapping("/instructors")
    public ResponseEntity<List<AdminUserDTO>> getInstructors() {
        List<User> allUsers = userRepository.findAll();
        List<AdminUserDTO> instructors = allUsers.stream()
                .filter(user -> user.getRoles().stream()
                        .anyMatch(role -> role.getName() == ERole.ROLE_LECTURER))
                .map(AdminUserDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(instructors);
    }

    /**
     * PUT /api/v1/admin/courses/{id}/transfer
     * Chuyển quyền sở hữu khóa học từ admin sang giảng viên
     */
    @PutMapping("/{id}/transfer")
    public ResponseEntity<CourseResponse> transferCourseOwnership(
            @PathVariable Long id,
            @RequestBody Map<String, Long> request
    ) {
        Long newInstructorId = request.get("instructorId");
        if (newInstructorId == null) {
            return ResponseEntity.badRequest().build();
        }
        
        Course updatedCourse = courseService.transferCourseOwnership(id, newInstructorId);
        return ResponseEntity.ok(CourseResponse.fromEntity(updatedCourse));
    }

    // Admin chỉ có quyền xem khóa học, không có quyền xóa
    // Chỉ giảng viên mới có quyền xóa khóa học của chính họ
}

