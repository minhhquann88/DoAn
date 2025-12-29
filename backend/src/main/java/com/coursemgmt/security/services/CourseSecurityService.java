package com.coursemgmt.security.services;

import com.coursemgmt.model.*;
import com.coursemgmt.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service("courseSecurityService")
@Transactional(readOnly = true)
public class CourseSecurityService {

    private static final Logger logger = LoggerFactory.getLogger(CourseSecurityService.class);

    // Đảm bảo bạn đã Autowired TẤT CẢ các repository cần thiết
    @Autowired private CourseRepository courseRepository;
    @Autowired private ChapterRepository chapterRepository;
    @Autowired private LessonRepository lessonRepository;
    @Autowired private EnrollmentRepository enrollmentRepository;
    @Autowired private UserRepository userRepository;

    // Kiểm tra chủ khóa học
    public boolean isInstructor(Authentication authentication, Long courseId) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Course course = courseRepository.findById(courseId).orElse(null);
        if (course == null || course.getInstructor() == null) return false;
        return course.getInstructor().getId().equals(userDetails.getId());
    }

    // Kiểm tra chủ chương
    public boolean isInstructorOfChapter(Authentication authentication, Long chapterId) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Chapter chapter = chapterRepository.findById(chapterId).orElse(null);
        if (chapter == null) return false;

        // Truy cập LAZY sẽ hoạt động vì đã có @Transactional
        return chapter.getCourse().getInstructor().getId().equals(userDetails.getId());
    }

    // Kiểm tra chủ bài học
    public boolean isInstructorOfLesson(Authentication authentication, Long lessonId) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Lesson lesson = lessonRepository.findById(lessonId).orElse(null);
        if (lesson == null) return false;

        return lesson.getChapter().getCourse().getInstructor().getId().equals(userDetails.getId());
    }


    // Kiểm tra đã ghi danh (cho bài học)
    public boolean isEnrolled(Authentication authentication, Long lessonId) {
        try {
            System.out.println("DEBUG isEnrolled: Checking enrollment for lessonId=" + lessonId);
            
            if (authentication == null || authentication.getPrincipal() == null) {
                logger.warn("isEnrolled: Authentication or principal is null");
                System.out.println("DEBUG isEnrolled: Authentication or principal is null");
                return false;
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            System.out.println("DEBUG isEnrolled: userId=" + userDetails.getId() + ", username=" + userDetails.getUsername());
            
            User user = userRepository.findById(userDetails.getId()).orElse(null);
            Lesson lesson = lessonRepository.findById(lessonId).orElse(null);

            if (user == null) {
                logger.warn("isEnrolled: User not found for ID: {}", userDetails.getId());
                System.out.println("DEBUG isEnrolled: User not found for ID: " + userDetails.getId());
                return false;
            }
            
            if (lesson == null) {
                logger.warn("isEnrolled: Lesson not found for ID: {}", lessonId);
                System.out.println("DEBUG isEnrolled: Lesson not found for ID: " + lessonId);
                return false;
            }
            
            System.out.println("DEBUG isEnrolled: Found lesson '" + lesson.getTitle() + "'");

            // Load chapter and course to avoid LazyInitializationException
            Chapter chapter = lesson.getChapter();
            if (chapter == null) {
                logger.warn("isEnrolled: Chapter not found for lesson ID: {}", lessonId);
                System.out.println("DEBUG isEnrolled: Chapter not found for lesson");
                return false;
            }
            
            System.out.println("DEBUG isEnrolled: Found chapter '" + chapter.getTitle() + "'");
            
            Course course = chapter.getCourse();
            if (course == null) {
                logger.warn("isEnrolled: Course not found for chapter ID: {}", chapter.getId());
                System.out.println("DEBUG isEnrolled: Course not found for chapter");
                return false;
            }
            
            System.out.println("DEBUG isEnrolled: Found course '" + course.getTitle() + "' (ID=" + course.getId() + ")");

            boolean enrolled = enrollmentRepository.findByUserAndCourse(user, course).isPresent();
            System.out.println("DEBUG isEnrolled: User " + user.getId() + " enrolled in course " + course.getId() + ": " + enrolled);
            logger.debug("isEnrolled: User {} enrolled in course {}: {}", user.getId(), course.getId(), enrolled);
            return enrolled;
        } catch (Exception e) {
            logger.error("Error in isEnrolled for lessonId {}: {}", lessonId, e.getMessage(), e);
            System.out.println("DEBUG isEnrolled ERROR: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    // Kiểm tra học viên có phải là chính họ không (cho enrollment)
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
            
            // Use equals() for proper Long comparison
            return userId.equals(studentId);
        } catch (Exception e) {
            logger.error("Error in isStudentOwner: {}", e.getMessage());
            return false;
        }
    }

}