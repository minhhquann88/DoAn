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
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElse(null);
        Lesson lesson = lessonRepository.findById(lessonId).orElse(null);

        if (user == null || lesson == null) return false;

        Course course = lesson.getChapter().getCourse();
        return enrollmentRepository.findByUserAndCourse(user, course).isPresent();
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