package com.coursemgmt.service;

import com.coursemgmt.dto.StudentDashboardStatsDTO;
import com.coursemgmt.model.*;
import com.coursemgmt.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
public class StudentDashboardService {

    @Autowired
    private EnrollmentRepository enrollmentRepository;
    
    @Autowired
    private UserProgressRepository userProgressRepository;
    
    @Autowired
    private CertificateRepository certificateRepository;

    /**
     * Lấy thống kê tổng quan cho Student Dashboard
     */
    @Transactional(readOnly = true)
    public StudentDashboardStatsDTO getDashboardStats(Long studentId) {
        // 1. Lấy tất cả enrollments của student
        List<Enrollment> enrollments = enrollmentRepository
            .findByUserId(studentId, org.springframework.data.domain.Pageable.unpaged())
            .getContent();
        
        // 2. Khóa học đang học (IN_PROGRESS và progress < 100%)
        long activeCourses = enrollments.stream()
            .filter(e -> e.getStatus() == EEnrollmentStatus.IN_PROGRESS || 
                        (e.getProgress() != null && e.getProgress() < 100.0))
            .count();
        
        // 3. Tính tổng giờ học
        double totalStudyHours = calculateTotalStudyHours(studentId);
        
        // 4. Tính giờ học tuần này
        LocalDateTime startOfWeek = LocalDateTime.now()
            .with(java.time.DayOfWeek.MONDAY)
            .withHour(0).withMinute(0).withSecond(0);
        double weeklyStudyHours = calculateWeeklyStudyHours(studentId, startOfWeek);
        
        // 5. Tiến độ trung bình
        double averageProgress = 0.0;
        if (!enrollments.isEmpty()) {
            double totalProgress = enrollments.stream()
                .mapToDouble(e -> e.getProgress() != null ? e.getProgress() : 0.0)
                .sum();
            averageProgress = totalProgress / enrollments.size();
        }
        
        // 6. Số chứng chỉ
        Long totalCertificates = certificateRepository
            .findByEnrollmentUserId(studentId, org.springframework.data.domain.Pageable.unpaged())
            .getTotalElements();
        
        return new StudentDashboardStatsDTO(
            activeCourses,
            totalStudyHours,
            weeklyStudyHours,
            averageProgress,
            totalCertificates != null ? totalCertificates : 0L
        );
    }

    /**
     * Tính tổng giờ học từ User_Progress
     * Sử dụng lastWatchedTime nếu có, nếu không thì dùng durationInMinutes của lesson
     */
    private double calculateTotalStudyHours(Long studentId) {
        // Lấy tất cả enrollments của student
        List<Enrollment> enrollments = enrollmentRepository
            .findByUserId(studentId, org.springframework.data.domain.Pageable.unpaged())
            .getContent();
        
        double totalMinutes = 0.0;
        
        for (Enrollment enrollment : enrollments) {
            // Lấy tất cả progress của enrollment này
            Set<User_Progress> progresses = userProgressRepository.findByEnrollmentWithLesson(enrollment);
            
            for (User_Progress progress : progresses) {
                if (progress.getLesson() != null) {
                    // Ưu tiên sử dụng lastWatchedTime nếu có
                    if (progress.getLastWatchedTime() != null && progress.getLastWatchedTime() > 0) {
                        // Convert seconds to minutes
                        totalMinutes += progress.getLastWatchedTime() / 60.0;
                    } else if (progress.getIsCompleted() != null && progress.getIsCompleted()) {
                        // Nếu đã hoàn thành, dùng durationInMinutes của lesson
                        if (progress.getLesson().getDurationInMinutes() != null) {
                            totalMinutes += progress.getLesson().getDurationInMinutes();
                        }
                    }
                }
            }
        }
        
        // Convert minutes to hours
        return Math.round((totalMinutes / 60.0) * 10.0) / 10.0; // Round to 1 decimal place
    }

    /**
     * Tính giờ học trong tuần này
     */
    private double calculateWeeklyStudyHours(Long studentId, LocalDateTime startOfWeek) {
        // Lấy tất cả enrollments của student
        List<Enrollment> enrollments = enrollmentRepository
            .findByUserId(studentId, org.springframework.data.domain.Pageable.unpaged())
            .getContent();
        
        double totalMinutes = 0.0;
        
        for (Enrollment enrollment : enrollments) {
            // Lấy tất cả progress của enrollment này
            Set<User_Progress> progresses = userProgressRepository.findByEnrollmentWithLesson(enrollment);
            
            for (User_Progress progress : progresses) {
                // Chỉ tính progress được completed trong tuần này
                if (progress.getCompletedAt() != null && 
                    progress.getCompletedAt().isAfter(startOfWeek)) {
                    if (progress.getLesson() != null) {
                        if (progress.getLastWatchedTime() != null && progress.getLastWatchedTime() > 0) {
                            totalMinutes += progress.getLastWatchedTime() / 60.0;
                        } else if (progress.getLesson().getDurationInMinutes() != null) {
                            totalMinutes += progress.getLesson().getDurationInMinutes();
                        }
                    }
                }
            }
        }
        
        // Convert minutes to hours
        return Math.round((totalMinutes / 60.0) * 10.0) / 10.0; // Round to 1 decimal place
    }
}

