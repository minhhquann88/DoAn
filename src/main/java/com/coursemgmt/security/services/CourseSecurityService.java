package com.coursemgmt.security.services;

import com.coursemgmt.model.Course;
import com.coursemgmt.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.coursemgmt.model.Chapter;
import com.coursemgmt.model.Course;
import com.coursemgmt.model.Lesson;
import com.coursemgmt.model.User;
import com.coursemgmt.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service("courseSecurityService") // Đặt tên Bean để gọi trong @PreAuthorize
public class CourseSecurityService {

    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private ChapterRepository chapterRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Kiểm tra xem user đang đăng nhập có phải là GIẢNG VIÊN (instructor)
     * của khóa học không.
     */
    public boolean isInstructor(Authentication authentication, Long courseId) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long currentUserId = userDetails.getId();

        Course course = courseRepository.findById(courseId).orElse(null);

        if (course == null || course.getInstructor() == null) {
            return false;
        }

        return course.getInstructor().getId().equals(currentUserId);
    }
    // Kiểm tra user có phải chủ của Chapter không
    public boolean isInstructorOfChapter(Authentication authentication, Long chapterId) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Chapter chapter = chapterRepository.findById(chapterId).orElse(null);
        if (chapter == null || chapter.getCourse().getInstructor() == null) return false;

        return chapter.getCourse().getInstructor().getId().equals(userDetails.getId());
    }

    // Kiểm tra user có phải chủ của Lesson không
    public boolean isInstructorOfLesson(Authentication authentication, Long lessonId) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Lesson lesson = lessonRepository.findById(lessonId).orElse(null);
        if (lesson == null || lesson.getChapter().getCourse().getInstructor() == null) return false;

        return lesson.getChapter().getCourse().getInstructor().getId().equals(userDetails.getId());
    }

    // Kiểm tra user (Student) đã đăng ký khóa học chứa bài học này chưa
    public boolean isEnrolled(Authentication authentication, Long lessonId) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElse(null);
        Lesson lesson = lessonRepository.findById(lessonId).orElse(null);

        if (user == null || lesson == null) return false;

        Course course = lesson.getChapter().getCourse();
        return enrollmentRepository.findByUserAndCourse(user, course).isPresent();
    }
}