package com.coursemgmt.service;

import com.coursemgmt.dto.CourseRequest;
import com.coursemgmt.dto.CourseResponse;
import com.coursemgmt.dto.CourseStatisticsResponse;
import com.coursemgmt.dto.ChapterResponse;
import com.coursemgmt.dto.LessonResponse;
import com.coursemgmt.exception.ResourceNotFoundException;
import com.coursemgmt.model.*;
import com.coursemgmt.repository.CategoryRepository;
import com.coursemgmt.repository.CourseRepository;
import com.coursemgmt.repository.EnrollmentRepository;
import com.coursemgmt.repository.UserRepository;
import com.coursemgmt.repository.ChapterRepository;
import com.coursemgmt.repository.LessonRepository;
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

    @Autowired
    private ChapterRepository chapterRepository;

    @Autowired
    private LessonRepository lessonRepository;

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

        // Phân quyền: Admin tạo thì PUBLISHED luôn, Giảng viên tạo thì DRAFT (Marketplace Model)
        boolean isAdmin = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals(ERole.ROLE_ADMIN.name()));

        if (isAdmin) {
            course.setStatus(ECourseStatus.PUBLISHED);
        } else {
            // Giảng viên tạo sẽ ở trạng thái DRAFT để có thể chỉnh sửa trước khi publish
            course.setStatus(ECourseStatus.DRAFT);
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

    // Chức năng: Gửi yêu cầu phê duyệt (Giảng viên)
    @Transactional
    public Course requestApproval(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found!"));

        // Chỉ cho phép gửi yêu cầu nếu khóa học đang ở trạng thái DRAFT hoặc đã bị từ chối
        // Nếu đã PUBLISHED thì không cần gửi lại
        if (course.getStatus() == ECourseStatus.PUBLISHED) {
            throw new RuntimeException("Khóa học đã được phê duyệt rồi!");
        }

        // Đặt trạng thái về PENDING_APPROVAL để chờ Admin duyệt
        course.setStatus(ECourseStatus.PENDING_APPROVAL);
        course.setUpdatedAt(LocalDateTime.now());

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
        CourseResponse dto = CourseResponse.fromEntity(course);
        // Tính enrollmentCount từ repository (tránh LAZY loading issue)
        Long enrollmentCount = enrollmentRepository.countByCourseId(courseId);
        dto.setEnrollmentCount(enrollmentCount != null ? enrollmentCount : 0L);
        return dto;
    }

    // Chức năng 5.1: Lấy danh sách khóa học nổi bật (Featured Courses)
    public List<CourseResponse> getFeaturedCourses() {
        // Lấy các khóa học được đánh dấu là featured và đã published (sử dụng @Query explicit)
        List<Course> featuredCourses = courseRepository.findFeaturedCourses();
        
        // Nếu không có khóa học nào được đánh dấu featured, fallback về 4 khóa học mới nhất đã published
        if (featuredCourses == null || featuredCourses.isEmpty()) {
            // Fallback: Get top 4 latest published courses if no featured ones found
            Pageable pageable = PageRequest.of(0, 4);
            featuredCourses = courseRepository.findLatestPublishedCourses(pageable);
        }
        
        // Convert sang DTO và tính enrollmentCount
        return featuredCourses.stream()
                .map(course -> {
                    CourseResponse dto = CourseResponse.fromEntity(course);
                    // Tính enrollmentCount từ repository (tránh LAZY loading issue)
                    Long enrollmentCount = enrollmentRepository.countByCourseId(course.getId());
                    dto.setEnrollmentCount(enrollmentCount != null ? enrollmentCount : 0L);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // Chức năng 6: Tìm kiếm, lọc, sắp xếp (Public)
    public Page<CourseResponse> getAllPublishedCourses(String keyword, Long categoryId, Double minPrice, Double maxPrice, Boolean isFree, Boolean isPaid, String level, Double minRating, int page, int size, String sort) {

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
        
        // Price filtering - Priority: isFree/isPaid > minPrice/maxPrice
        if (isFree != null && isFree) {
            // Free courses: price = 0 (use isFree specification)
            spec = spec.and(CourseRepository.isFree());
        } else if (isPaid != null && isPaid) {
            // Paid courses: price > 0 (use isPaid specification)
            spec = spec.and(CourseRepository.isPaid());
        } else if (minPrice != null || maxPrice != null) {
            // Use price range if minPrice or maxPrice is provided (but not isFree/isPaid)
            spec = spec.and(CourseRepository.priceRange(minPrice, maxPrice));
        }
        
        // Level filtering
        // Note: Course entity currently doesn't have a 'level' field
        // Level filtering will be implemented when level field is added to Course entity
        // if (level != null && !level.isEmpty()) {
        //     spec = spec.and(CourseRepository.hasLevel(level));
        // }
        
        // Rating filtering (if Course entity has rating field)
        // Note: This will be implemented when rating field is added to Course entity
        // if (minRating != null) {
        //     spec = spec.and(CourseRepository.minRating(minRating));
        // }

        // 3. Truy vấn
        Page<Course> coursePage = courseRepository.findAll(spec, pageable);

        // 4. Convert sang DTO và tính enrollmentCount
        List<CourseResponse> dtos = coursePage.getContent().stream()
                .map(course -> {
                    CourseResponse dto = CourseResponse.fromEntity(course);
                    // Tính enrollmentCount từ repository (tránh LAZY loading issue)
                    Long enrollmentCount = enrollmentRepository.countByCourseId(course.getId());
                    dto.setEnrollmentCount(enrollmentCount != null ? enrollmentCount : 0L);
                    return dto;
                })
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

    // Chức năng 7.1: Đánh dấu khóa học là nổi bật (Featured) - Chỉ Admin
    @Transactional
    public Course toggleFeatured(Long courseId, Boolean isFeatured) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));
        
        course.setIsFeatured(isFeatured != null ? isFeatured : true);
        course.setUpdatedAt(LocalDateTime.now());
        
        return courseRepository.save(course);
    }

    // Chức năng 8: Giảng viên gửi yêu cầu phê duyệt khóa học
    @Transactional
    public Course requestApproval(Long courseId, UserDetailsImpl userDetails) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found!"));

        // Kiểm tra xem người gửi yêu cầu có phải là giảng viên của khóa học không
        if (!course.getInstructor().getId().equals(userDetails.getId())) {
            throw new RuntimeException("You are not authorized to request approval for this course.");
        }

        // Không cho phép gửi yêu cầu nếu khóa học đã PUBLISHED
        if (ECourseStatus.PUBLISHED.equals(course.getStatus())) {
            throw new RuntimeException("Course is already published and cannot be sent for re-approval.");
        }

        course.setStatus(ECourseStatus.PENDING_APPROVAL);
        course.setUpdatedAt(LocalDateTime.now());
        return courseRepository.save(course);
    }

    // Chức năng 9: Giảng viên tự publish khóa học (Marketplace Model - Self-Publish)
    @Transactional
    public Course publishCourse(Long courseId, UserDetailsImpl userDetails) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found!"));

        // Authorization: Ensure the current user is the owner of the course (or Admin)
        boolean isAdmin = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals(ERole.ROLE_ADMIN.name()));

        if (!isAdmin && !course.getInstructor().getId().equals(userDetails.getId())) {
            throw new RuntimeException("You are not authorized to publish this course.");
        }

        // Validation: Ensure the course is currently in DRAFT status
        if (course.getStatus() != ECourseStatus.DRAFT) {
            throw new RuntimeException("Only DRAFT courses can be published. Current status: " + course.getStatus());
        }

        // Optional: Check if course has at least 1 chapter (recommended for marketplace)
        if (course.getChapters() == null || course.getChapters().isEmpty()) {
            throw new RuntimeException("Course must have at least one chapter before publishing.");
        }

        // Action: Update status to PUBLISHED
        course.setStatus(ECourseStatus.PUBLISHED);
        course.setUpdatedAt(LocalDateTime.now());
        return courseRepository.save(course);
    }

    // Chức năng 10: Lấy preview curriculum (Public - for guests)
    // This endpoint is PUBLIC and does NOT require authentication
    // It returns course structure without user progress data
    public List<ChapterResponse> getCoursePreview(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        // Only return preview for published courses
        if (course.getStatus() != ECourseStatus.PUBLISHED) {
            throw new RuntimeException("Course is not published!");
        }

        // Get all chapters with lessons (using JOIN FETCH to avoid LAZY loading issues)
        List<Chapter> chapters = chapterRepository.findByCourseIdWithLessons(courseId);
        
        if (chapters == null || chapters.isEmpty()) {
            return List.of(); // Return empty list if no chapters
        }

        // Map to DTO - For preview, return all lessons with videoUrl for first lesson of each chapter
        return chapters.stream()
                .filter(chapter -> chapter != null) // Filter out null chapters
                .map(chapter -> {
                    // Get lessons safely - handle null/empty list
                    List<Lesson> lessons = chapter.getLessons();
                    if (lessons == null || lessons.isEmpty()) {
                        // Return chapter with empty lessons list
                        return ChapterResponse.fromEntity(chapter, List.of());
                    }
                    
                    // Sort lessons by position (handle null positions)
                    List<Lesson> sortedLessons = lessons.stream()
                            .filter(lesson -> lesson != null) // Filter out null lessons
                            .sorted((l1, l2) -> {
                                Integer pos1 = l1.getPosition() != null ? l1.getPosition() : Integer.MAX_VALUE;
                                Integer pos2 = l2.getPosition() != null ? l2.getPosition() : Integer.MAX_VALUE;
                                return Integer.compare(pos1, pos2);
                            })
                            .collect(Collectors.toList());
                    
                    if (sortedLessons.isEmpty()) {
                        return ChapterResponse.fromEntity(chapter, List.of());
                    }
                    
                    // Get first lesson ID for preview identification
                    Long firstLessonId = sortedLessons.get(0).getId();
                    
                    // Map lessons to DTOs
                    List<LessonResponse> lessonResponses = sortedLessons.stream()
                            .map(lesson -> {
                                // Check if this is the first lesson of the chapter (for preview)
                                boolean isFirstLesson = firstLessonId != null && firstLessonId.equals(lesson.getId());
                                
                                // Create response - for preview, always set isCompleted = false (no user progress)
                                LessonResponse response = new LessonResponse();
                                response.setId(lesson.getId());
                                response.setTitle(lesson.getTitle());
                                response.setContentType(lesson.getContentType());
                                response.setDurationInMinutes(lesson.getDurationInMinutes());
                                response.setPosition(lesson.getPosition());
                                response.setCompleted(false); // No progress tracking for guests
                                
                                // Set isPreview: Use database value if available, otherwise mark first lesson as preview
                                Boolean isPreviewFromDb = lesson.getIsPreview();
                                if (isPreviewFromDb != null) {
                                    response.setIsPreview(isPreviewFromDb);
                                } else {
                                    // Fallback: Mark first lesson of each chapter as preview if it has video
                                    response.setIsPreview(isFirstLesson && lesson.getVideoUrl() != null && lesson.getContentType() == EContentType.VIDEO);
                                }
                                
                                // For preview: Always include videoUrl for first lesson of each chapter OR if isPreview is true
                                boolean isPreview = response.getIsPreview() != null && response.getIsPreview();
                                if ((isFirstLesson || isPreview) && lesson.getVideoUrl() != null && lesson.getContentType() == EContentType.VIDEO) {
                                    response.setVideoUrl(lesson.getVideoUrl());
                                }
                                
                                // Note: We don't set documentUrl or content for preview (guests can't access full content)
                                
                                return response;
                            })
                            .collect(Collectors.toList());
                    
                    return ChapterResponse.fromEntity(chapter, lessonResponses);
                })
                .collect(Collectors.toList());
    }
}