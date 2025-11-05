package com.coursemgmt.security.services;

import com.coursemgmt.model.*;
import com.coursemgmt.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service("courseSecurityService")
@Transactional(readOnly = true)
public class CourseSecurityService {

    // Đảm bảo bạn đã Autowired TẤT CẢ các repository cần thiết
    @Autowired private CourseRepository courseRepository;
    @Autowired private ChapterRepository chapterRepository;
    @Autowired private LessonRepository lessonRepository;
    @Autowired private EnrollmentRepository enrollmentRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private TestRepository testRepository;
    @Autowired private TestResultRepository testResultRepository;

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

    // Kiểm tra chủ bài test
    public boolean isInstructorOfTest(Authentication authentication, Long testId) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Test test = testRepository.findById(testId).orElse(null);
        if (test == null) return false;

        return test.getLesson().getChapter().getCourse().getInstructor().getId().equals(userDetails.getId());
    }

    // Kiểm tra chủ bài nộp
    public boolean isOwnerOfResult(Authentication authentication, Long resultId) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Test_Result result = testResultRepository.findById(resultId).orElse(null);
        if (result == null || result.getUser() == null) return false;

        return result.getUser().getId().equals(userDetails.getId());
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

    // Kiểm tra đã ghi danh (cho bài test)
    public boolean isEnrolledInTest(Authentication authentication, Long testId) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElse(null);
        Test test = testRepository.findById(testId).orElse(null);

        if (user == null || test == null) return false;

        Course course = test.getLesson().getChapter().getCourse();
        return enrollmentRepository.findByUserAndCourse(user, course).isPresent();
    }
}