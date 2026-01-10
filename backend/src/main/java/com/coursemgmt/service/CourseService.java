package com.coursemgmt.service;

import com.coursemgmt.dto.CourseRequest;
import com.coursemgmt.dto.CourseResponse;
import com.coursemgmt.exception.ResourceNotFoundException;
import com.coursemgmt.model.*;
import com.coursemgmt.model.EEnrollmentStatus;
import com.coursemgmt.repository.CategoryRepository;
import com.coursemgmt.repository.CourseRepository;
import com.coursemgmt.repository.EnrollmentRepository;
import com.coursemgmt.repository.ReviewRepository;
import com.coursemgmt.repository.UserRepository;
import com.coursemgmt.repository.ChapterRepository;
import com.coursemgmt.repository.LessonRepository;
import com.coursemgmt.repository.TransactionRepository;
import com.coursemgmt.repository.CartItemRepository;
import com.coursemgmt.repository.NotificationRepository;
import com.coursemgmt.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.ArrayList;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @PersistenceContext
    private EntityManager entityManager;
    @Autowired
    private EnrollmentRepository enrollmentRepository;
    @Autowired
    private ChapterRepository chapterRepository;
    @Autowired
    private LessonRepository lessonRepository;
    @Autowired
    private TransactionRepository transactionRepository;
    @Autowired
    private ReviewRepository reviewRepository;
    @Autowired
    private CartItemRepository cartItemRepository;
    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private NewsletterService newsletterService;

    // Lấy User từ security context
    private User getCurrentUser(UserDetailsImpl userDetails) {
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found!"));
    }

    // Lấy ID của user hiện tại từ SecurityContext
    private Long getCurrentUserId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !(authentication.getPrincipal() instanceof UserDetails)) {
                return null;
            }
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
            return user != null ? user.getId() : null;
        } catch (Exception e) {
            return null;
        }
    }

    // Lấy danh sách course ID mà user đã đăng ký
    private Set<Long> getEnrolledCourseIds(Long userId) {
        if (userId == null) {
            return Collections.emptySet();
        }
        try {
            Set<Long> enrolledIds = enrollmentRepository.findEnrolledCourseIdsByUserId(userId);
            return enrolledIds != null ? enrolledIds : Collections.emptySet();
        } catch (Exception e) {
            return Collections.emptySet();
        }
    }

    // Lấy map enrollment (courseId -> Enrollment) để lấy progress và status
    private Map<Long, Enrollment> getEnrollmentMap(Long userId) {
        if (userId == null) {
            return Collections.emptyMap();
        }
        try {
            List<Enrollment> enrollments = enrollmentRepository.findByUserIdWithCourse(userId);
            if (enrollments == null || enrollments.isEmpty()) {
                return Collections.emptyMap();
            }
            return enrollments.stream()
                    .filter(e -> e.getCourse() != null)
                    .collect(Collectors.toMap(
                            e -> e.getCourse().getId(),
                            e -> e,
                            (e1, e2) -> e1
                    ));
        } catch (Exception e) {
            return Collections.emptyMap();
        }
    }

    // Tạo khóa học mới
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

        // Admin tạo → PUBLISHED, Giảng viên tạo → DRAFT
        boolean isAdmin = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals(ERole.ROLE_ADMIN.name()));

        if (isAdmin) {
            course.setStatus(ECourseStatus.PUBLISHED);
        } else {
            course.setStatus(ECourseStatus.DRAFT);
        }

        Course savedCourse = courseRepository.save(course);

        // Gửi email thông báo nếu khóa học được publish ngay
        if (savedCourse.getStatus() == ECourseStatus.PUBLISHED) {
            try {
                String courseUrl = "http://localhost:3000/courses/" + savedCourse.getId();
                newsletterService.sendNewCourseNotification(savedCourse.getTitle(), courseUrl);
            } catch (Exception e) {
                // Không throw exception để không ảnh hưởng đến việc tạo khóa học
            }
        }

        return savedCourse;
    }

    // Cập nhật khóa học
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

        return courseRepository.save(course);
    }

    // Xóa khóa học
    @Transactional
    public void deleteCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found!"));
        
        reviewRepository.deleteByCourseId(courseId);
        cartItemRepository.deleteByCourseId(courseId);
        notificationRepository.deleteByCourseId(courseId);
        enrollmentRepository.deleteByCourseId(courseId);
        transactionRepository.deleteByCourseId(courseId);
        courseRepository.delete(course);
    }

    // Lấy thông tin chi tiết khóa học
    public CourseResponse getCourseById(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));
        CourseResponse dto = CourseResponse.fromEntity(course);
        
        Long enrollmentCount = enrollmentRepository.countByCourseId(courseId);
        dto.setEnrollmentCount(enrollmentCount != null ? enrollmentCount : 0L);
        
        Double avgRating = reviewRepository.getAverageRatingByCourseId(courseId);
        Long reviewCount = reviewRepository.countByCourseId(courseId);
        dto.setRating(avgRating != null ? avgRating : 0.0);
        dto.setReviewCount(reviewCount != null ? reviewCount : 0L);
        
        Long currentUserId = getCurrentUserId();
        if (currentUserId != null) {
            boolean isEnrolled = enrollmentRepository.existsByUserIdAndCourseId(currentUserId, courseId);
            dto.setIsEnrolled(isEnrolled);
        } else {
            dto.setIsEnrolled(false);
        }
        
        return dto;
    }

    // Lấy danh sách khóa học nổi bật
    public List<CourseResponse> getFeaturedCourses() {
        List<Course> featuredCourses = courseRepository.findFeaturedCourses();
        
        if (featuredCourses == null || featuredCourses.isEmpty()) {
            Pageable pageable = PageRequest.of(0, 4);
            featuredCourses = courseRepository.findLatestPublishedCourses(pageable);
        }
        
        Long currentUserId = getCurrentUserId();
        Set<Long> enrolledIds = getEnrolledCourseIds(currentUserId);
        Map<Long, Enrollment> enrollmentMap = getEnrollmentMap(currentUserId);
        
        return featuredCourses.stream()
                .map(course -> {
                    CourseResponse dto = CourseResponse.fromEntity(course);
                    Long enrollmentCount = enrollmentRepository.countByCourseId(course.getId());
                    dto.setEnrollmentCount(enrollmentCount != null ? enrollmentCount : 0L);
                    
                    Double avgRating = reviewRepository.getAverageRatingByCourseId(course.getId());
                    Long reviewCount = reviewRepository.countByCourseId(course.getId());
                    dto.setRating(avgRating != null ? avgRating : 0.0);
                    dto.setReviewCount(reviewCount != null ? reviewCount : 0L);
                    
                    boolean isEnrolled = enrolledIds.contains(course.getId());
                    dto.setIsEnrolled(isEnrolled);
                    
                    if (isEnrolled) {
                        Enrollment enrollment = enrollmentMap.get(course.getId());
                        if (enrollment != null) {
                            dto.setEnrollmentProgress(enrollment.getProgress() != null ? enrollment.getProgress() : 0.0);
                            dto.setEnrollmentStatus(enrollment.getStatus() != null ? enrollment.getStatus().name() : "IN_PROGRESS");
                        }
                    }
                    
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // Lấy tất cả khóa học cho Admin (không filter theo published)
    @Transactional(readOnly = true)
    public Page<Course> getAllCoursesForAdmin(Pageable pageable, String search, String status) {
        String baseQuery = "SELECT DISTINCT c FROM Course c LEFT JOIN FETCH c.instructor LEFT JOIN FETCH c.category WHERE 1=1";
        String countQuery = "SELECT COUNT(DISTINCT c) FROM Course c WHERE 1=1";
        
        List<String> conditions = new ArrayList<>();
        List<Object> params = new ArrayList<>();
        int paramIndex = 1;
        
        if (search != null && !search.trim().isEmpty()) {
            conditions.add("LOWER(c.title) LIKE LOWER(?" + paramIndex + ")");
            params.add("%" + search.trim() + "%");
            paramIndex++;
        }
        
        if (status != null && !status.trim().isEmpty()) {
            try {
                ECourseStatus courseStatus = ECourseStatus.valueOf(status.toUpperCase());
                conditions.add("c.status = ?" + paramIndex);
                params.add(courseStatus);
                paramIndex++;
            } catch (IllegalArgumentException e) {
                // Invalid status, ignore
            }
        }
        
        if (!conditions.isEmpty()) {
            String whereClause = " AND " + String.join(" AND ", conditions);
            baseQuery += whereClause;
            countQuery += whereClause;
        }
        
        baseQuery += " ORDER BY c.createdAt DESC";
        
        jakarta.persistence.Query countQ = entityManager.createQuery(countQuery);
        for (int i = 0; i < params.size(); i++) {
            countQ.setParameter(i + 1, params.get(i));
        }
        Long total = (Long) countQ.getSingleResult();
        
        jakarta.persistence.Query query = entityManager.createQuery(baseQuery, Course.class);
        for (int i = 0; i < params.size(); i++) {
            query.setParameter(i + 1, params.get(i));
        }
        query.setFirstResult((int) pageable.getOffset());
        query.setMaxResults(pageable.getPageSize());
        
        @SuppressWarnings("unchecked")
        List<Course> courses = query.getResultList();
        
        return new PageImpl<>(courses, pageable, total);
    }

    // Tìm kiếm, lọc, sắp xếp khóa học đã published
    public Page<CourseResponse> getAllPublishedCourses(String keyword, Long categoryId, Double minPrice, Double maxPrice, Boolean isFree, Boolean isPaid, String level, Double minRating, int page, int size, String sort) {
        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams[1].equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));

        Specification<Course> spec = CourseRepository.isPublished();

        if (keyword != null && !keyword.isEmpty()) {
            spec = spec.and(CourseRepository.titleContains(keyword));
        }
        if (categoryId != null) {
            spec = spec.and(CourseRepository.hasCategory(categoryId));
        }
        
        if (isFree != null && isFree) {
            spec = spec.and(CourseRepository.isFree());
        } else if (isPaid != null && isPaid) {
            spec = spec.and(CourseRepository.isPaid());
        } else if (minPrice != null || maxPrice != null) {
            spec = spec.and(CourseRepository.priceRange(minPrice, maxPrice));
        }
        
        Page<Course> coursePage = courseRepository.findAll(spec, pageable);

        Long currentUserId = getCurrentUserId();
        Set<Long> enrolledIds = getEnrolledCourseIds(currentUserId);
        Map<Long, Enrollment> enrollmentMap = getEnrollmentMap(currentUserId);

        List<CourseResponse> dtos = coursePage.getContent().stream()
                .map(course -> {
                    CourseResponse dto = CourseResponse.fromEntity(course);
                    Long enrollmentCount = enrollmentRepository.countByCourseId(course.getId());
                    dto.setEnrollmentCount(enrollmentCount != null ? enrollmentCount : 0L);
                    
                    Double avgRating = reviewRepository.getAverageRatingByCourseId(course.getId());
                    Long reviewCount = reviewRepository.countByCourseId(course.getId());
                    dto.setRating(avgRating != null ? avgRating : 0.0);
                    dto.setReviewCount(reviewCount != null ? reviewCount : 0L);
                    
                    boolean isEnrolled = enrolledIds.contains(course.getId());
                    dto.setIsEnrolled(isEnrolled);
                    
                    if (isEnrolled) {
                        Enrollment enrollment = enrollmentMap.get(course.getId());
                        if (enrollment != null) {
                            dto.setEnrollmentProgress(enrollment.getProgress() != null ? enrollment.getProgress() : 0.0);
                            dto.setEnrollmentStatus(enrollment.getStatus() != null ? enrollment.getStatus().name() : "IN_PROGRESS");
                        }
                    }
                    
                    return dto;
                })
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, coursePage.getTotalElements());
    }

    // Giảng viên tự publish khóa học
    @Transactional
    public Course publishCourse(Long courseId, UserDetailsImpl userDetails) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found!"));

        if (course.getInstructor() == null || !course.getInstructor().getId().equals(userDetails.getId())) {
            throw new RuntimeException("You are not authorized to publish this course.");
        }
        if (course.getStatus() != ECourseStatus.DRAFT) {
            throw new RuntimeException("Only DRAFT courses can be published. Current status: " + course.getStatus());
        }
        List<Chapter> chapters = chapterRepository.findByCourseIdOrderByPositionAsc(courseId);
        if (chapters == null || chapters.isEmpty()) {
            throw new RuntimeException("Khóa học phải có ít nhất 1 chương trước khi xuất bản. Vui lòng thêm nội dung cho khóa học.");
        }
        for (Chapter chapter : chapters) {
            List<Lesson> lessons = lessonRepository.findByChapterIdOrderByPositionAsc(chapter.getId());
            if (lessons == null || lessons.isEmpty()) {
                throw new RuntimeException("Chương \"" + chapter.getTitle() + "\" phải có ít nhất 1 bài học. Vui lòng thêm bài học cho chương này.");
            }
        }
        
        course.setStatus(ECourseStatus.PUBLISHED);
        course.setIsPublished(true);
        course.setUpdatedAt(LocalDateTime.now());
        return courseRepository.save(course);
    }

    // Giảng viên gỡ khóa học  - PUBLISHED -> DRAFT
    @Transactional
    public Course unpublishCourse(Long courseId, UserDetailsImpl userDetails) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found!"));


        if ( !course.getInstructor().getId().equals(userDetails.getId())) {
            throw new RuntimeException("You are not authorized to unpublish this course.");
        }

        if (course.getStatus() != ECourseStatus.PUBLISHED) {
            throw new RuntimeException("Only PUBLISHED courses can be unpublished. Current status: " + course.getStatus());
        }

        course.setStatus(ECourseStatus.DRAFT);
        course.setIsPublished(false);
        course.setUpdatedAt(LocalDateTime.now());
        return courseRepository.save(course);
    }

    // Lấy danh sách khóa học của học viên (My Courses)
    @Transactional(readOnly = true)
    public List<CourseResponse> getMyCourses(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return List.of();
        }
        
        try {
            List<Enrollment> enrollments = enrollmentRepository.findByUserIdWithCourse(userId);
            
            return enrollments.stream()
                    .map(enrollment -> {
                            Course course = enrollment.getCourse();
                            if (course == null) {
                                return null;
                            }
                            
                            CourseResponse dto = CourseResponse.fromEntity(course);
                            Long enrollmentCount = enrollmentRepository.countByCourseId(course.getId());
                            dto.setEnrollmentCount(enrollmentCount != null ? enrollmentCount : 0L);
                            
                            Double avgRating = reviewRepository.getAverageRatingByCourseId(course.getId());
                            Long reviewCount = reviewRepository.countByCourseId(course.getId());
                            dto.setRating(avgRating != null ? avgRating : 0.0);
                            dto.setReviewCount(reviewCount != null ? reviewCount : 0L);
                            
                            dto.setIsEnrolled(true);
                        dto.setEnrollmentProgress(enrollment.getProgress() != null ? enrollment.getProgress() : 0.0);
                        dto.setEnrollmentStatus(enrollment.getStatus() != null ? enrollment.getStatus().name() : "IN_PROGRESS");
                            
                            return dto;
                    })
                    .filter(dto -> dto != null)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch my courses: " + e.getMessage(), e);
        }
    }
}