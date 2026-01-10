package com.coursemgmt.security.services;

import com.coursemgmt.model.*;
import com.coursemgmt.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Service kiểm tra quyền truy cập (Authorization) cho các API liên quan đến khóa học
// Được sử dụng trong @PreAuthorize annotations để bảo vệ các endpoints
// VD: @PreAuthorize("hasRole('ADMIN') or @courseSecurityService.isInstructor(authentication, #courseId)")
@Service("courseSecurityService")
@Transactional(readOnly = true) // Chỉ đọc dữ liệu, không cần ghi
public class CourseSecurityService {

    private static final Logger logger = LoggerFactory.getLogger(CourseSecurityService.class);

    // Các repository cần thiết để truy vấn database
    @Autowired private CourseRepository courseRepository;
    @Autowired private ChapterRepository chapterRepository;
    @Autowired private LessonRepository lessonRepository;
    @Autowired private EnrollmentRepository enrollmentRepository;
    @Autowired private UserRepository userRepository;

    // Kiểm tra user hiện tại có phải là giảng viên của khóa học không
    // Sử dụng trong: CourseController, ChapterController, EnrollmentController
    public boolean isInstructor(Authentication authentication, Long courseId) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Course course = courseRepository.findById(courseId).orElse(null);
        if (course == null || course.getInstructor() == null) return false;
        return course.getInstructor().getId().equals(userDetails.getId());
    }

    // Kiểm tra user hiện tại có phải là giảng viên của chapter không
    // (Thông qua việc kiểm tra giảng viên của khóa học chứa chapter đó)
    // Sử dụng trong: ChapterController
    public boolean isInstructorOfChapter(Authentication authentication, Long chapterId) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Chapter chapter = chapterRepository.findById(chapterId).orElse(null);
        if (chapter == null) return false;

        // Truy cập LAZY sẽ hoạt động vì đã có @Transactional
        // Lấy course từ chapter, rồi lấy instructor từ course
        return chapter.getCourse().getInstructor().getId().equals(userDetails.getId());
    }

    // Kiểm tra user hiện tại có phải là giảng viên của lesson không
    // (Thông qua việc kiểm tra giảng viên của khóa học chứa lesson đó)
    // Sử dụng trong: ChapterController
    public boolean isInstructorOfLesson(Authentication authentication, Long lessonId) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Lesson lesson = lessonRepository.findById(lessonId).orElse(null);
        if (lesson == null) return false;

        // Lấy chapter từ lesson, rồi lấy course từ chapter, rồi lấy instructor từ course
        return lesson.getChapter().getCourse().getInstructor().getId().equals(userDetails.getId());
    }

    // Kiểm tra học viên đã đăng ký khóa học chứa lesson này chưa
    // Sử dụng trong: ContentAccessController (để học viên chỉ xem được lesson đã đăng ký)
    public boolean isEnrolled(Authentication authentication, Long lessonId) {
        try {
            // Kiểm tra authentication hợp lệ
            if (authentication == null || authentication.getPrincipal() == null) {
                logger.warn("isEnrolled: Authentication or principal is null");
                return false;
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            // Lấy thông tin user và lesson từ database
            User user = userRepository.findById(userDetails.getId()).orElse(null);
            Lesson lesson = lessonRepository.findById(lessonId).orElse(null);

            if (user == null) {
                logger.warn("isEnrolled: User not found for ID: {}", userDetails.getId());
                return false;
            }
            
            if (lesson == null) {
                logger.warn("isEnrolled: Lesson not found for ID: {}", lessonId);
                return false;
            }

            // Lấy chapter và course từ lesson (để tránh LazyInitializationException)
            Chapter chapter = lesson.getChapter();
            if (chapter == null) {
                logger.warn("isEnrolled: Chapter not found for lesson ID: {}", lessonId);
                return false;
            }
            
            Course course = chapter.getCourse();
            if (course == null) {
                logger.warn("isEnrolled: Course not found for chapter ID: {}", chapter.getId());
                return false;
            }

            // Kiểm tra xem user đã đăng ký khóa học chưa
            boolean enrolled = enrollmentRepository.findByUserAndCourse(user, course).isPresent();
            logger.debug("isEnrolled: User {} enrolled in course {}: {}", user.getId(), course.getId(), enrolled);
            return enrolled;
        } catch (Exception e) {
            logger.error("Error in isEnrolled for lessonId {}: {}", lessonId, e.getMessage(), e);
            return false;
        }
    }

    // Kiểm tra học viên có phải là chính họ không (cho enrollment)
    // Sử dụng trong: EnrollmentController (để học viên chỉ xem được enrollment của chính họ)
    public boolean isStudentOwner(Authentication authentication, Long studentId) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return false;
        }
        
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();
            
            if (userId == null || studentId == null) {
                return false;
            }
            
            // So sánh ID của user hiện tại với studentId (dùng equals() để so sánh Long)
            return userId.equals(studentId);
        } catch (Exception e) {
            logger.error("Error in isStudentOwner: {}", e.getMessage());
            return false;
        }
    }

}