package com.coursemgmt.service;

import com.coursemgmt.dto.*;
import com.coursemgmt.exception.ResourceNotFoundException;
import com.coursemgmt.model.*;
import com.coursemgmt.repository.*;
import com.coursemgmt.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
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
    @Autowired
    private VideoDurationService videoDurationService;

    // =========================================================================
    // QUẢN LÝ CHƯƠNG (CHAPTER MANAGEMENT)
    // =========================================================================

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

    @Transactional
    public void reorderChapters(Long courseId, Map<Long, Integer> chapterPositions) {
        chapterPositions.forEach((id, pos) -> {
            chapterRepository.findById(id).ifPresent(chapter -> {
                if (chapter.getCourse().getId().equals(courseId)) {
                    chapter.setPosition(pos);
                    chapterRepository.save(chapter);
                }
            });
        });
    }

    // =========================================================================
    // QUẢN LÝ BÀI HỌC (LESSON MANAGEMENT)
    // =========================================================================

    @Transactional
    public Lesson createLesson(Long chapterId, LessonRequest request) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new RuntimeException("Chapter not found!"));
        Lesson lesson = new Lesson();
        mapRequestToLesson(lesson, request);
        lesson.setChapter(chapter);
        return lessonRepository.save(lesson);
    }

    @Transactional
    public Lesson updateLesson(Long lessonId, LessonRequest request) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found!"));
        mapRequestToLesson(lesson, request);
        return lessonRepository.save(lesson);
    }

    private void mapRequestToLesson(Lesson lesson, LessonRequest request) {
        lesson.setTitle(request.getTitle());
        lesson.setContentType(request.getContentType());
        lesson.setVideoUrl(request.getVideoUrl());
        lesson.setDocumentUrl(request.getDocumentUrl());
        lesson.setSlideUrl(request.getSlideUrl());
        lesson.setContent(request.getContent());
        lesson.setPosition(request.getPosition());
        lesson.setIsPreview(request.getIsPreview() != null ? request.getIsPreview() : false);

        if (request.getContentType() == EContentType.YOUTUBE) {
            lesson.setDurationInMinutes(0);
        } else {
            Integer duration = calculateDuration(request);
            lesson.setDurationInMinutes(duration != null ? duration
                    : (request.getDurationInMinutes() != null ? request.getDurationInMinutes() : 0));
        }
    }

    private Integer calculateDuration(LessonRequest request) {
        if (request.getVideoUrl() == null || request.getVideoUrl().isEmpty())
            return null;
        if (videoDurationService.isYouTubeUrl(request.getVideoUrl())) {
            String apiKey = System.getenv("YOUTUBE_API_KEY");
            if (apiKey != null && !apiKey.isEmpty()) {
                Integer secs = videoDurationService.extractDurationFromYouTubeUrlWithAPI(request.getVideoUrl(), apiKey);
                if (secs != null)
                    return videoDurationService.roundDurationToMinutes(secs);
            }
        }
        return null;
    }

    @Transactional
    public void deleteLesson(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found!"));
        lessonRepository.delete(lesson);
    }

    @Transactional
    public void reorderLessons(Long chapterId, Map<Long, Integer> lessonPositions) {
        lessonPositions.forEach((id, pos) -> {
            lessonRepository.findById(id).ifPresent(lesson -> {
                if (lesson.getChapter().getId().equals(chapterId)) {
                    lesson.setPosition(pos);
                    lessonRepository.save(lesson);
                }
            });
        });
    }

    /**
     * Lấy danh sách bài học của một chương (Sắp xếp theo vị trí)
     */
    public List<Lesson> getChapterLessons(Long chapterId) {
        return lessonRepository.findByChapterIdOrderByPositionAsc(chapterId);
    }

    public Lesson getLessonById(Long lessonId) {
        return lessonRepository.findById(lessonId).orElseThrow(() -> new RuntimeException("Lesson not found!"));
    }

    // =========================================================================
    // TRUY CẬP NỘI DUNG (CONTENT ACCESS)
    // =========================================================================

    /**
     * Lấy toàn bộ nội dung khóa học cho học viên đã đăng ký
     */
    public List<ChapterResponse> getCourseContent(Long courseId, UserDetailsImpl userDetails) {
        if (userDetails == null)
            throw new RuntimeException("User not authenticated");

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userDetails.getId()));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        boolean isInstructor = course.getInstructor() != null && course.getInstructor().getId().equals(user.getId());
        Enrollment enrollment = enrollmentRepository.findByUserAndCourse(user, course).orElse(null);

        if (!isInstructor && enrollment == null) {
            throw new AccessDeniedException("Bạn chưa đăng ký khóa học này!");
        }

        Set<Long> completedLessonIds = (enrollment == null) ? Set.of()
                : userProgressRepository.findByEnrollmentWithLesson(enrollment).stream()
                        .filter(p -> p != null && Boolean.TRUE.equals(p.getIsCompleted()) && p.getLesson() != null)
                        .map(p -> p.getLesson().getId())
                        .collect(Collectors.toSet());

        List<Chapter> chapters = chapterRepository.findByCourseIdWithLessons(courseId);
        return chapters.stream()
                .sorted(Comparator.comparing(c -> c.getPosition() != null ? c.getPosition() : Integer.MAX_VALUE))
                .map(chapter -> {
                    List<LessonResponse> lessons = chapter.getLessons().stream()
                            .sorted(Comparator
                                    .comparing(l -> l.getPosition() != null ? l.getPosition() : Integer.MAX_VALUE))
                            .map(l -> LessonResponse.fromEntity(l,
                                    isInstructor || completedLessonIds.contains(l.getId())))
                            .collect(Collectors.toList());
                    return ChapterResponse.fromEntity(chapter, lessons);
                }).collect(Collectors.toList());
    }

    /**
     * Lấy bài học xem trước đầu tiên
     */
    public LessonResponse getPreviewLesson(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));
        if (course.getPrice() == null || course.getPrice() <= 0)
            return null;

        return chapterRepository.findByCourseIdWithLessons(courseId).stream()
                .min(Comparator.comparing(c -> c.getPosition() != null ? c.getPosition() : Integer.MAX_VALUE))
                .flatMap(c -> c.getLessons().stream()
                        .filter(l -> (l.getContentType() == EContentType.VIDEO
                                || l.getContentType() == EContentType.YOUTUBE) && l.getVideoUrl() != null)
                        .min(Comparator.comparing(l -> l.getPosition() != null ? l.getPosition() : Integer.MAX_VALUE)))
                .map(l -> LessonResponse.fromEntity(l, false))
                .orElse(null);
    }

    /**
     * Lấy khung chương trình công khai (Public Curriculum)
     */
    public List<ChapterResponse> getPublicCurriculum(Long courseId, Long previewLessonId) {
        List<Chapter> chapters = chapterRepository.findByCourseIdWithLessons(courseId);
        return chapters.stream()
                .sorted(Comparator.comparing(c -> c.getPosition() != null ? c.getPosition() : Integer.MAX_VALUE))
                .map(chapter -> {
                    List<LessonResponse> lessons = chapter.getLessons().stream()
                            .sorted(Comparator
                                    .comparing(l -> l.getPosition() != null ? l.getPosition() : Integer.MAX_VALUE))
                            .map(l -> {
                                LessonResponse res = new LessonResponse();
                                res.setId(l.getId());
                                res.setTitle(l.getTitle());
                                res.setContentType(l.getContentType());
                                res.setPosition(l.getPosition());
                                res.setDurationInMinutes(l.getDurationInMinutes());
                                res.setIsPreview(previewLessonId != null && l.getId().equals(previewLessonId));
                                return res;
                            }).collect(Collectors.toList());
                    return ChapterResponse.fromEntity(chapter, lessons);
                }).collect(Collectors.toList());
    }

    // =========================================================================
    // THEO DÕI TIẾN ĐỘ (PROGRESS TRACKING)
    // =========================================================================

    @Transactional
    public void markLessonAsCompleted(Long lessonId, UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found!"));
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found!"));
        Enrollment enrollment = enrollmentRepository.findByUserAndCourse(user, lesson.getChapter().getCourse())
                .orElseThrow(() -> new RuntimeException("Bạn chưa đăng ký khóa học này!"));

        User_Progress progress = userProgressRepository.findByEnrollmentAndLesson(enrollment, lesson)
                .orElse(new User_Progress());
        progress.setEnrollment(enrollment);
        progress.setLesson(lesson);
        progress.setIsCompleted(true);
        progress.setCompletedAt(LocalDateTime.now());
        userProgressRepository.save(progress);
        updateEnrollmentProgress(enrollment);
    }

    @Transactional
    public void updateLessonWatchTime(Long lessonId, Integer watchedTime, Integer totalDuration,
            UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found!"));
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found!"));
        Enrollment enrollment = enrollmentRepository.findByUserAndCourse(user, lesson.getChapter().getCourse())
                .orElseThrow(() -> new RuntimeException("Bạn chưa đăng ký khóa học này!"));

        User_Progress progress = userProgressRepository.findByEnrollmentAndLesson(enrollment, lesson)
                .orElse(new User_Progress());
        if (progress.getEnrollment() == null) {
            progress.setEnrollment(enrollment);
            progress.setLesson(lesson);
        }
        progress.setLastWatchedTime(watchedTime);
        progress.setTotalDuration(totalDuration);

        double percent = (double) watchedTime / totalDuration;
        if (percent >= 0.9 && !Boolean.TRUE.equals(progress.getIsCompleted())) {
            progress.setIsCompleted(true);
            progress.setCompletedAt(LocalDateTime.now());
            updateEnrollmentProgress(enrollment);
        }
        userProgressRepository.save(progress);
    }

    private void updateEnrollmentProgress(Enrollment enrollment) {
        long total = lessonRepository.countByChapter_Course_Id(enrollment.getCourse().getId());
        if (total == 0) {
            enrollment.setProgress(100.0);
            enrollment.setStatus(EEnrollmentStatus.COMPLETED);
            enrollmentRepository.save(enrollment);
            certificateService.autoIssueCertificate(enrollment);
            return;
        }

        long completed = userProgressRepository.countByEnrollmentAndIsCompleted(enrollment, true);
        double percent = Math.round(((double) completed / total) * 10000.0) / 100.0;
        enrollment.setProgress(percent);

        if (percent >= 100.0) {
            enrollment.setStatus(EEnrollmentStatus.COMPLETED);
            certificateService.autoIssueCertificate(enrollment);
        }
        enrollmentRepository.save(enrollment);
    }
}
