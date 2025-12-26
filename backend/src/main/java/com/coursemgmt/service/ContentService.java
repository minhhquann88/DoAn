package com.coursemgmt.service;

import com.coursemgmt.dto.CertificateRequest;
import com.coursemgmt.dto.ChapterRequest;
import com.coursemgmt.dto.ChapterResponse;
import com.coursemgmt.dto.LessonRequest;
import com.coursemgmt.dto.LessonResponse;
import com.coursemgmt.exception.ResourceNotFoundException;
import com.coursemgmt.model.*;
import com.coursemgmt.repository.*;
import com.coursemgmt.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
public class ContentService {

    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private ChapterRepository chapterRepository;
    @Autowired
    private LessonRepository lessonRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private EnrollmentRepository enrollmentRepository;
    @Autowired
    private UserProgressRepository userProgressRepository;
    @Autowired
    private CertificateService certificateService;

    private static final Logger logger = Logger.getLogger(ContentService.class.getName());

    // --- Quản lý Chapter ---

    @Transactional
    public Chapter createChapter(Long courseId, ChapterRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found!"));

        Chapter chapter = new Chapter();
        chapter.setTitle(request.getTitle());
        chapter.setPosition(request.getPosition());
        chapter.setCourse(course);
        return chapterRepository.save(chapter);
    }

    @Transactional
    public Chapter updateChapter(Long chapterId, ChapterRequest request) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new RuntimeException("Chapter not found!"));

        chapter.setTitle(request.getTitle());
        chapter.setPosition(request.getPosition());
        return chapterRepository.save(chapter);
    }

    @Transactional
    public void deleteChapter(Long chapterId) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new RuntimeException("Chapter not found!"));
        chapterRepository.delete(chapter);
    }

    // --- Quản lý Lesson ---

    @Transactional
    public Lesson createLesson(Long chapterId, LessonRequest request) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new RuntimeException("Chapter not found!"));

        Lesson lesson = new Lesson();
        lesson.setTitle(request.getTitle());
        lesson.setContentType(request.getContentType());
        lesson.setVideoUrl(request.getVideoUrl());
        lesson.setDocumentUrl(request.getDocumentUrl());
        lesson.setContent(request.getContent());
        lesson.setPosition(request.getPosition());
        lesson.setDurationInMinutes(request.getDurationInMinutes());
        lesson.setChapter(chapter);

        return lessonRepository.save(lesson);
    }

    @Transactional
    public Lesson updateLesson(Long lessonId, LessonRequest request) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found!"));

        lesson.setTitle(request.getTitle());
        lesson.setContentType(request.getContentType());
        lesson.setVideoUrl(request.getVideoUrl());
        lesson.setDocumentUrl(request.getDocumentUrl());
        lesson.setContent(request.getContent());
        lesson.setPosition(request.getPosition());
        lesson.setDurationInMinutes(request.getDurationInMinutes());

        return lessonRepository.save(lesson);
    }

    @Transactional
    public void deleteLesson(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found!"));
        lessonRepository.delete(lesson);
    }

    // --- Lấy nội dung (cho Học viên) ---

    // Lấy toàn bộ nội dung (chapters + lessons) của 1 khóa học
    public List<ChapterResponse> getCourseContent(Long courseId, UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userDetails.getId()));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        // Kiểm tra xem user có phải là chủ khóa học không
        boolean isInstructor = course.getInstructor() != null && 
                               course.getInstructor().getId().equals(user.getId());

        // Lấy thông tin Enrollment
        Enrollment enrollment = enrollmentRepository.findByUserAndCourse(user, course).orElse(null);

        // Nếu không phải Giảng viên VÀ chưa đăng ký, ném lỗi
        if (!isInstructor && enrollment == null) {
            throw new RuntimeException("Bạn chưa đăng ký khóa học này!");
        }

        // Lấy danh sách ID các bài học đã hoàn thành
        Set<Long> completedLessonIds = Set.of();
        if (enrollment != null) {
            completedLessonIds = userProgressRepository.findByEnrollment(enrollment).stream()
                    .filter(User_Progress::getIsCompleted)
                    .map(progress -> progress.getLesson().getId())
                    .collect(Collectors.toSet());
        }

        final Set<Long> finalCompletedLessonIds = completedLessonIds; // Cần final để dùng trong lambda

        // Lấy danh sách Chapters
        List<Chapter> chapters = chapterRepository.findByCourseIdOrderByPositionAsc(courseId);

        // Map sang DTO
        return chapters.stream().map(chapter -> {
            List<LessonResponse> lessonResponses = chapter.getLessons().stream()
                    .map(lesson -> {
                        boolean isCompleted = isInstructor || finalCompletedLessonIds.contains(lesson.getId());
                        return LessonResponse.fromEntity(lesson, isCompleted);
                    })
                    .collect(Collectors.toList());
            return ChapterResponse.fromEntity(chapter, lessonResponses);
        }).collect(Collectors.toList());
    }

    // --- Chức năng: Theo dõi tiến độ ---
    @Transactional
    public void markLessonAsCompleted(Long lessonId, UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId()).orElseThrow(() -> new RuntimeException("User not found!"));
        Lesson lesson = lessonRepository.findById(lessonId).orElseThrow(() -> new RuntimeException("Lesson not found!"));
        Course course = lesson.getChapter().getCourse();

        // Tìm enrollment của user cho khóa học này
        Enrollment enrollment = enrollmentRepository.findByUserAndCourse(user, course)
                .orElseThrow(() -> new RuntimeException("Bạn chưa đăng ký khóa học này!"));

        // Tìm hoặc tạo mới User_Progress
        User_Progress progress = userProgressRepository.findByEnrollmentAndLesson(enrollment, lesson)
                .orElse(new User_Progress());

        progress.setEnrollment(enrollment);
        progress.setLesson(lesson);
        progress.setIsCompleted(true);
        progress.setCompletedAt(LocalDateTime.now());
        userProgressRepository.save(progress);

        // Cập nhật lại % tiến độ tổng của Enrollment
        updateEnrollmentProgress(enrollment);
    }

    // --- Chức năng: Cập nhật tiến độ xem video (Auto-Progress) ---
    @Transactional
    public void updateLessonWatchTime(Long lessonId, Integer watchedTime, Integer totalDuration, UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found!"));
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found!"));
        Course course = lesson.getChapter().getCourse();

        // Tìm enrollment của user cho khóa học này
        Enrollment enrollment = enrollmentRepository.findByUserAndCourse(user, course)
                .orElseThrow(() -> new RuntimeException("Bạn chưa đăng ký khóa học này!"));

        // Tìm hoặc tạo mới User_Progress
        User_Progress progress = userProgressRepository.findByEnrollmentAndLesson(enrollment, lesson)
                .orElse(new User_Progress());

        // Set enrollment and lesson if this is a new progress record
        if (progress.getEnrollment() == null) {
            progress.setEnrollment(enrollment);
            progress.setLesson(lesson);
        }

        // Update watched time and total duration
        progress.setLastWatchedTime(watchedTime);
        progress.setTotalDuration(totalDuration);

        // Calculate watch percentage
        double percent = (double) watchedTime / totalDuration;

        // Crucial Check: IF watched >= 90% AND not already completed -> Auto-complete
        if (percent >= 0.9 && !Boolean.TRUE.equals(progress.getIsCompleted())) {
            progress.setIsCompleted(true);
            progress.setCompletedAt(LocalDateTime.now());
            
            // Trigger course-level progress recalculation
            updateEnrollmentProgress(enrollment);
        }

        // Save progress (whether completed or not)
        userProgressRepository.save(progress);
    }

    // Hàm private để tính toán lại tiến độ
    private void updateEnrollmentProgress(Enrollment enrollment) {
        long totalLessonsInCourse = lessonRepository.countByChapter_Course_Id(enrollment.getCourse().getId());
        if (totalLessonsInCourse == 0) {
            enrollment.setProgress(100.0);
            enrollment.setStatus(EEnrollmentStatus.COMPLETED);
            enrollmentRepository.save(enrollment);
            
            // Auto-issue certificate for courses with no lessons
            autoIssueCertificate(enrollment);
            return;
        }

        long completedLessons = userProgressRepository.countByEnrollmentAndIsCompleted(enrollment, true);

        double progressPercentage = ((double) completedLessons / totalLessonsInCourse) * 100.0;
        enrollment.setProgress(progressPercentage);

        if (progressPercentage >= 100.0) {
            enrollment.setStatus(EEnrollmentStatus.COMPLETED);
            enrollmentRepository.save(enrollment);
            
            // Auto-issue certificate when course is completed
            autoIssueCertificate(enrollment);
        } else {
            enrollment.setStatus(EEnrollmentStatus.IN_PROGRESS);
            enrollmentRepository.save(enrollment);
        }
    }

    /**
     * Auto-issue certificate when enrollment reaches 100% completion
     */
    private void autoIssueCertificate(Enrollment enrollment) {
        try {
            CertificateRequest certRequest = new CertificateRequest();
            certRequest.setEnrollmentId(enrollment.getId());
            // Optional: Set final score if available
            // certRequest.setFinalScore(calculateFinalScore(enrollment));
            
            certificateService.issueCertificate(certRequest);
            logger.info("Auto-issued certificate for Enrollment ID: " + enrollment.getId());
        } catch (RuntimeException e) {
            // Handle cases where certificate already exists or other errors
            // Log but don't fail the enrollment update
            if (e.getMessage() != null && e.getMessage().contains("already issued")) {
                logger.info("Certificate already exists for Enrollment ID: " + enrollment.getId() + " - Skipping auto-issue");
            } else {
                logger.warning("Failed to auto-issue certificate for Enrollment ID: " + enrollment.getId() + " - Error: " + e.getMessage());
            }
        } catch (Exception e) {
            // Catch any other unexpected exceptions
            logger.severe("Unexpected error while auto-issuing certificate for Enrollment ID: " + enrollment.getId() + " - Error: " + e.getMessage());
        }
    }
}