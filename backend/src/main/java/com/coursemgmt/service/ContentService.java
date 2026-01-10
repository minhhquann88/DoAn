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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
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

    @Autowired
    private VideoDurationService videoDurationService;

    @Transactional
    public Lesson createLesson(Long chapterId, LessonRequest request) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new RuntimeException("Chapter not found!"));

        Lesson lesson = new Lesson();
        lesson.setTitle(request.getTitle());
        lesson.setContentType(request.getContentType());
        lesson.setVideoUrl(request.getVideoUrl());
        lesson.setDocumentUrl(request.getDocumentUrl());
        lesson.setSlideUrl(request.getSlideUrl());
        lesson.setContent(request.getContent());
        lesson.setPosition(request.getPosition());
        
        // Tự động tính duration nếu có video URL (không áp dụng cho YOUTUBE)
        if (request.getContentType() == EContentType.YOUTUBE) {
            lesson.setDurationInMinutes(0);
        } else {
            Integer duration = calculateDuration(request);
            lesson.setDurationInMinutes(duration != null ? duration : (request.getDurationInMinutes() != null ? request.getDurationInMinutes() : 0));
        }
        
        lesson.setIsPreview(request.getIsPreview() != null ? request.getIsPreview() : false);
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
        lesson.setSlideUrl(request.getSlideUrl());
        lesson.setContent(request.getContent());
        lesson.setPosition(request.getPosition());
        
        // Tự động tính duration nếu có video URL (không áp dụng cho YOUTUBE)
        if (request.getContentType() == EContentType.YOUTUBE) {
            // YouTube không cần duration, set = 0
            lesson.setDurationInMinutes(0);
        } else if (request.getVideoUrl() != null && !request.getVideoUrl().equals(lesson.getVideoUrl())) {
            Integer duration = calculateDuration(request);
            lesson.setDurationInMinutes(duration != null ? duration : (request.getDurationInMinutes() != null ? request.getDurationInMinutes() : 0));
        } else {
            lesson.setDurationInMinutes(request.getDurationInMinutes() != null ? request.getDurationInMinutes() : 0);
        }
        
        lesson.setIsPreview(request.getIsPreview() != null ? request.getIsPreview() : false);

        return lessonRepository.save(lesson);
    }

    // Tính duration tự động từ video URL
    private Integer calculateDuration(LessonRequest request) {
        if (request.getVideoUrl() == null || request.getVideoUrl().isEmpty()) {
            return null;
        }

        if (videoDurationService.isYouTubeUrl(request.getVideoUrl())) {
            String youtubeApiKey = System.getenv("YOUTUBE_API_KEY");
            if (youtubeApiKey != null && !youtubeApiKey.isEmpty()) {
                Integer durationInSeconds = videoDurationService.extractDurationFromYouTubeUrlWithAPI(
                    request.getVideoUrl(), youtubeApiKey
                );
                if (durationInSeconds != null) {
                    return videoDurationService.roundDurationToMinutes(durationInSeconds);
                }
            }
            return null;
        }
        return null;
    }

    @Transactional
    public void deleteLesson(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found!"));
        lessonRepository.delete(lesson);
    }

    // Helper method to get lessons for a chapter
    public List<Lesson> getChapterLessons(Long chapterId) {
        return lessonRepository.findByChapterIdOrderByPositionAsc(chapterId);
    }

    // Get lesson by ID
    public Lesson getLessonById(Long lessonId) {
        return lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found!"));
    }

    // Lấy preview lesson đầu tiên của khóa học (public)
    public LessonResponse getPreviewLesson(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));
        
        if (course.getPrice() == null || course.getPrice() <= 0) {
            return null;
        }
        
        List<Chapter> chapters = chapterRepository.findByCourseIdWithLessons(courseId);
        
        if (chapters == null || chapters.isEmpty()) {
            return null;
        }
        
        Chapter firstChapter = chapters.stream()
                .min((c1, c2) -> {
                    int pos1 = c1.getPosition() != null ? c1.getPosition() : Integer.MAX_VALUE;
                    int pos2 = c2.getPosition() != null ? c2.getPosition() : Integer.MAX_VALUE;
                    return Integer.compare(pos1, pos2);
                })
                .orElse(null);
        
        if (firstChapter == null || firstChapter.getLessons() == null || firstChapter.getLessons().isEmpty()) {
            return null;
        }
        
        Lesson firstLesson = firstChapter.getLessons().stream()
                .min((l1, l2) -> {
                    int pos1 = l1.getPosition() != null ? l1.getPosition() : Integer.MAX_VALUE;
                    int pos2 = l2.getPosition() != null ? l2.getPosition() : Integer.MAX_VALUE;
                    return Integer.compare(pos1, pos2);
                })
                .orElse(null);
        
        if (firstLesson == null) {
            return null;
        }
        
        if ((firstLesson.getContentType() != EContentType.VIDEO && firstLesson.getContentType() != EContentType.YOUTUBE) || 
            firstLesson.getVideoUrl() == null || firstLesson.getVideoUrl().isEmpty()) {
            return null;
        }
        
        return LessonResponse.fromEntity(firstLesson, false);
    }

    // Lấy curriculum công khai (chỉ tên chapters và lessons, không có nội dung chi tiết)
    public List<ChapterResponse> getPublicCurriculum(Long courseId, Long previewLessonId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));
        
        List<Chapter> chapters = chapterRepository.findByCourseIdWithLessons(courseId);
        
        return chapters.stream()
                .sorted((c1, c2) -> {
                    int pos1 = c1.getPosition() != null ? c1.getPosition() : Integer.MAX_VALUE;
                    int pos2 = c2.getPosition() != null ? c2.getPosition() : Integer.MAX_VALUE;
                    return Integer.compare(pos1, pos2);
                })
                .map(chapter -> {
                    List<LessonResponse> lessonResponses = chapter.getLessons().stream()
                            .sorted((l1, l2) -> {
                                int pos1 = l1.getPosition() != null ? l1.getPosition() : Integer.MAX_VALUE;
                                int pos2 = l2.getPosition() != null ? l2.getPosition() : Integer.MAX_VALUE;
                                return Integer.compare(pos1, pos2);
                            })
                            .map(lesson -> {
                                LessonResponse lessonResponse = new LessonResponse();
                                lessonResponse.setId(lesson.getId());
                                lessonResponse.setTitle(lesson.getTitle());
                                lessonResponse.setContentType(lesson.getContentType());
                                lessonResponse.setPosition(lesson.getPosition());
                                lessonResponse.setDurationInMinutes(lesson.getDurationInMinutes());
                                lessonResponse.setIsPreview(previewLessonId != null && lesson.getId().equals(previewLessonId));
                                return lessonResponse;
                            })
                            .collect(Collectors.toList());
                    
                    return ChapterResponse.fromEntity(chapter, lessonResponses);
                })
                .collect(Collectors.toList());
    }

    // Reorder chapters
    @Transactional
    public void reorderChapters(Long courseId, Map<Long, Integer> chapterPositions) {
        for (Map.Entry<Long, Integer> entry : chapterPositions.entrySet()) {
            Chapter chapter = chapterRepository.findById(entry.getKey())
                    .orElseThrow(() -> new RuntimeException("Chapter not found: " + entry.getKey()));
            if (chapter.getCourse().getId().equals(courseId)) {
                chapter.setPosition(entry.getValue());
                chapterRepository.save(chapter);
            }
        }
    }

    // Reorder lessons in a chapter
    @Transactional
    public void reorderLessons(Long chapterId, Map<Long, Integer> lessonPositions) {
        for (Map.Entry<Long, Integer> entry : lessonPositions.entrySet()) {
            Lesson lesson = lessonRepository.findById(entry.getKey())
                    .orElseThrow(() -> new RuntimeException("Lesson not found: " + entry.getKey()));
            if (lesson.getChapter().getId().equals(chapterId)) {
                lesson.setPosition(entry.getValue());
                lessonRepository.save(lesson);
            }
        }
    }

    // Lấy toàn bộ nội dung  của 1 khóa học
    public List<ChapterResponse> getCourseContent(Long courseId, UserDetailsImpl userDetails) {
        if (userDetails == null) {
            throw new RuntimeException("User not authenticated");
        }
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userDetails.getId()));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        boolean isInstructor = course.getInstructor() != null && 
                               course.getInstructor().getId().equals(user.getId());

        Enrollment enrollment = enrollmentRepository.findByUserAndCourse(user, course).orElse(null);
        
        if (enrollment == null) {
            enrollment = enrollmentRepository.findByUserIdAndCourseId(user.getId(), courseId).orElse(null);
        }

        if (!isInstructor && enrollment == null) {
            throw new AccessDeniedException("Bạn chưa đăng ký khóa học này! Vui lòng đăng ký để xem nội dung.");
        }

        // Lấy danh sách bài học đã hoàn thành
        Set<Long> completedLessonIds = Set.of();

        if (enrollment != null) {
            try {
                Set<User_Progress> progressSet = userProgressRepository.findByEnrollmentWithLesson(enrollment);
                
                completedLessonIds = progressSet.stream()
                        .filter(progress -> {
                            if (progress == null) return false;
                            Boolean isCompleted = progress.getIsCompleted();
                            return isCompleted != null && isCompleted;
                        })
                        .filter(progress -> {
                            try {
                                return progress.getLesson() != null && progress.getLesson().getId() != null;
                            } catch (Exception e) {
                                return false;
                            }
                        })
                        .map(progress -> {
                            try {
                                return progress.getLesson().getId();
                            } catch (Exception e) {
                                return null;
                            }
                        })
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet());
            } catch (Exception e) {
                completedLessonIds = Set.of();
            }
        }
        // Tạo Set các lessonId đã hoàn thành
        final Set<Long> finalCompletedLessonIds = completedLessonIds;

        // Lấy danh sách chapters và lessons
        List<Chapter> chapters;
        try {
            chapters = chapterRepository.findByCourseIdWithLessons(courseId);
            
            if (chapters.isEmpty()) {
                return List.of();
            }
        } catch (Exception e) {
            throw new RuntimeException("Không thể tải nội dung khóa học: " + e.getMessage(), e);
        }

        // Xử lý từng chương
        try {
            List<Chapter> sortedChapters = chapters.stream()
                    .sorted((c1, c2) -> {
                        int pos1 = c1.getPosition() != null ? c1.getPosition() : Integer.MAX_VALUE;
                        int pos2 = c2.getPosition() != null ? c2.getPosition() : Integer.MAX_VALUE;
                        return Integer.compare(pos1, pos2);
                    })
                    .toList();
            
            return sortedChapters.stream().map(chapter -> {
                List<Lesson> sortedLessons = chapter.getLessons().stream()
                        .sorted((l1, l2) -> {
                            int pos1 = l1.getPosition() != null ? l1.getPosition() : Integer.MAX_VALUE;
                            int pos2 = l2.getPosition() != null ? l2.getPosition() : Integer.MAX_VALUE;
                            return Integer.compare(pos1, pos2);
                        })
                        .toList();

                List<LessonResponse> lessonResponses = new java.util.ArrayList<>();
                Lesson previousLesson = null;
                
                for (int i = 0; i < sortedLessons.size(); i++) {
                    Lesson lesson = sortedLessons.get(i);
                    boolean isCompleted = isInstructor || finalCompletedLessonIds.contains(lesson.getId());
                    
                    boolean isLocked = false;
                    
                    if (!isInstructor) {
                        if (i == 0) {
                            boolean isFirstChapter = sortedChapters.indexOf(chapter) == 0;
                            if (isFirstChapter) {
                                isLocked = false;
                            } else {
                                int currentChapterIndex = sortedChapters.indexOf(chapter);
                                Chapter previousChapter = sortedChapters.get(currentChapterIndex - 1);

                                List<Lesson> previousChapterLessons = previousChapter.getLessons().stream()
                                        .sorted((l1, l2) -> {
                                            int pos1 = l1.getPosition() != null ? l1.getPosition() : Integer.MAX_VALUE;
                                            int pos2 = l2.getPosition() != null ? l2.getPosition() : Integer.MAX_VALUE;
                                            return Integer.compare(pos1, pos2);
                                        })
                                        .toList();

                                if (!previousChapterLessons.isEmpty()) {
                                    Lesson lastLessonInPreviousChapter = previousChapterLessons.getLast();
                                    boolean lastLessonCompleted = finalCompletedLessonIds.contains(lastLessonInPreviousChapter.getId());
                                    isLocked = !lastLessonCompleted;
                                } else {
                                    isLocked = false;
                                }
                            }
                        } else {
                            boolean previousLessonCompleted = finalCompletedLessonIds.contains(previousLesson.getId());
                            isLocked = !previousLessonCompleted;
                        }
                    }
                    
                    lessonResponses.add(LessonResponse.fromEntity(lesson, isCompleted, isLocked));
                    previousLesson = lesson;
                }
                
                return ChapterResponse.fromEntity(chapter, lessonResponses);
            }).collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Không thể xử lý nội dung khóa học: " + e.getMessage(), e);
        }
    }

    // Đánh dấu bài học đã hoàn thành
    @Transactional
    public void markLessonAsCompleted(Long lessonId, UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));
        
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài học với ID: " + lessonId));
        
        Chapter chapter = lesson.getChapter();
        if (chapter == null) {
            throw new RuntimeException("Bài học chưa được gán vào chương nào!");
        }
        
        Course course = chapter.getCourse();
        if (course == null) {
            throw new RuntimeException("Chương chưa được gán vào khóa học nào!");
        }

        Enrollment enrollment = enrollmentRepository.findByUserAndCourse(user, course)
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

    // Cập nhật tiến độ xem video (Auto-Progress)
    @Transactional
    public void updateLessonWatchTime(Long lessonId, Integer watchedTime, Integer totalDuration, UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found!"));
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found!"));
        Course course = lesson.getChapter().getCourse();

        Enrollment enrollment = enrollmentRepository.findByUserAndCourse(user, course)
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

    // Tính toán lại tiến độ enrollment
    private void updateEnrollmentProgress(Enrollment enrollment) {
        long totalLessonsInCourse = lessonRepository.countByChapter_Course_Id(enrollment.getCourse().getId());
        if (totalLessonsInCourse == 0) {
            enrollment.setProgress(100.0);
            enrollment.setStatus(EEnrollmentStatus.COMPLETED);
            enrollmentRepository.save(enrollment);
            autoIssueCertificate(enrollment);
            return;
        }

        long completedLessons = userProgressRepository.countByEnrollmentAndIsCompleted(enrollment, true);

        double progressPercentage = totalLessonsInCourse > 0 
            ? ((double) completedLessons / totalLessonsInCourse) * 100.0 
            : 100.0;
        
        progressPercentage = Math.round(progressPercentage * 100.0) / 100.0;
        
        enrollment.setProgress(progressPercentage);

        if (progressPercentage >= 100.0) {
            enrollment.setStatus(EEnrollmentStatus.COMPLETED);
            enrollmentRepository.save(enrollment);
            autoIssueCertificate(enrollment);
        } else {
            enrollment.setStatus(EEnrollmentStatus.IN_PROGRESS);
            enrollmentRepository.save(enrollment);
        }
    }

    // Tự động cấp chứng chỉ khi hoàn thành khóa học
    private void autoIssueCertificate(Enrollment enrollment) {
        try {
            boolean certificateExists = certificateService.existsByEnrollmentId(enrollment.getId());
            
            if (certificateExists) {
                return;
            }
            
            CertificateRequest certRequest = new CertificateRequest();
            certRequest.setEnrollmentId(enrollment.getId());
            
            certificateService.issueCertificate(certRequest);
        } catch (Exception e) {
            // Log but don't fail the enrollment update
        }
    }
}