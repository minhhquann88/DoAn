package com.coursemgmt.service;

import com.coursemgmt.dto.CourseRequest;
import com.coursemgmt.dto.CourseResponse;
import com.coursemgmt.dto.CourseStatisticsResponse;
import com.coursemgmt.exception.ResourceNotFoundException;
import com.coursemgmt.model.*;
import com.coursemgmt.repository.CategoryRepository;
import com.coursemgmt.repository.CourseRepository;
import com.coursemgmt.repository.EnrollmentRepository;
import com.coursemgmt.repository.UserRepository;
import com.coursemgmt.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    // Hàm chung để lấy User từ security context
    private User getCurrentUser(UserDetailsImpl userDetails) {
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found!"));
    }

    // Chức năng 1: Tạo khóa học
    @Transactional
    public Course createCourse(CourseRequest request, UserDetailsImpl userDetails) {
        User instructor = getCurrentUser(userDetails);
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found!"));

        Course course = new Course();
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setPrice(request.getPrice());
        course.setImageUrl(request.getImageUrl());
        course.setTotalDurationInHours(request.getTotalDurationInHours());
        course.setCategory(category);
        course.setInstructor(instructor);
        course.setCreatedAt(LocalDateTime.now());
        course.setUpdatedAt(LocalDateTime.now());

        // Phân quyền: Admin tạo thì PUBLISHED luôn, Giảng viên tạo thì PENDING
        boolean isAdmin = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals(ERole.ROLE_ADMIN.name()));

        if (isAdmin) {
            course.setStatus(ECourseStatus.PUBLISHED);
        } else {
            // Giảng viên tạo sẽ cần Admin duyệt
            course.setStatus(ECourseStatus.PENDING_APPROVAL);
        }

        return courseRepository.save(course);
    }

    // Chức năng 2: Cập nhật khóa học
    @Transactional
    public Course updateCourse(Long courseId, CourseRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found!"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found!"));

        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setPrice(request.getPrice());
        course.setImageUrl(request.getImageUrl());
        course.setTotalDurationInHours(request.getTotalDurationInHours());
        course.setCategory(category);
        course.setUpdatedAt(LocalDateTime.now());
        // Khi cập nhật, có thể reset status về PENDING để admin duyệt lại
        // course.setStatus(ECourseStatus.PENDING_APPROVAL);

        return courseRepository.save(course);
    }

    // Chức năng 3: Xóa khóa học
    @Transactional
    public void deleteCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found!"));
        courseRepository.delete(course);
    }

    // Chức năng 4: Admin duyệt khóa học
    @Transactional
    public Course approveCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found!"));

        course.setStatus(ECourseStatus.PUBLISHED);
        course.setUpdatedAt(LocalDateTime.now());
        return courseRepository.save(course);
    }

    // Chức năng 5: Lấy 1 khóa học
    public CourseResponse getCourseById(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));
        return CourseResponse.fromEntity(course);
    }

    // Chức năng 6: Tìm kiếm, lọc, sắp xếp (Public)
    public Page<CourseResponse> getAllPublishedCourses(String keyword, Long categoryId, int page, int size, String sort) {

        // 1. Phân trang và Sắp xếp
        // 'sort' có dạng: "price,asc" hoặc "createdAt,desc"
        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams[1].equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));

        // 2. Tạo Specification (bộ lọc động)
        Specification<Course> spec = CourseRepository.isPublished();

        if (keyword != null && !keyword.isEmpty()) {
            spec = spec.and(CourseRepository.titleContains(keyword));
        }
        if (categoryId != null) {
            spec = spec.and(CourseRepository.hasCategory(categoryId));
        }

        // 3. Truy vấn
        Page<Course> coursePage = courseRepository.findAll(spec, pageable);

        // 4. Convert sang DTO
        List<CourseResponse> dtos = coursePage.getContent().stream()
                .map(CourseResponse::fromEntity)
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, coursePage.getTotalElements());
    }

    // Chức năng 7: Thống kê
    public CourseStatisticsResponse getCourseStatistics(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found!"));

        Long totalEnrollments = enrollmentRepository.countByCourseId(courseId);

        return new CourseStatisticsResponse(courseId, course.getTitle(), totalEnrollments);
    }
}