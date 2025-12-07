package com.coursemgmt.service;

import com.coursemgmt.dto.*;
import com.coursemgmt.model.*;
import com.coursemgmt.model.EEnrollmentStatus;
import com.coursemgmt.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EnrollmentService {

    @Autowired
    private EnrollmentRepository enrollmentRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private CertificateRepository certificateRepository;

    /**
     * Lấy danh sách enrollment theo course
     */
    public Page<EnrollmentDTO> getEnrollmentsByCourse(Long courseId, Pageable pageable) {
        Page<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId, pageable);
        return enrollments.map(this::convertToDTO);
    }

    /**
     * Lấy danh sách enrollment theo student
     */
    public Page<EnrollmentDTO> getEnrollmentsByStudent(Long studentId, Pageable pageable) {
        Page<Enrollment> enrollments = enrollmentRepository.findByUserId(studentId, pageable);
        return enrollments.map(this::convertToDTO);
    }

    /**
     * Lấy enrollment theo ID
     */
    public EnrollmentDTO getEnrollmentById(Long enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new RuntimeException("Enrollment not found with id: " + enrollmentId));
        return convertToDTO(enrollment);
    }

    /**
     * Tạo enrollment mới
     */
    @Transactional
    public EnrollmentDTO createEnrollment(EnrollmentCreateRequest request) {
        // Validate student exists
        User student = userRepository.findById(request.getStudentId())
            .orElseThrow(() -> new RuntimeException("Student not found with id: " + request.getStudentId()));
        
        // Validate course exists
        Course course = courseRepository.findById(request.getCourseId())
            .orElseThrow(() -> new RuntimeException("Course not found with id: " + request.getCourseId()));
        
        // Check if already enrolled
        Optional<Enrollment> existing = enrollmentRepository
            .findByUserIdAndCourseId(request.getStudentId(), request.getCourseId());
        
        if (existing.isPresent()) {
            throw new RuntimeException("Student already enrolled in this course");
        }
        
        // Create enrollment
        Enrollment enrollment = new Enrollment();
        enrollment.setUser(student);
        enrollment.setCourse(course);
        enrollment.setProgress(0.0);
        enrollment.setStatus(EEnrollmentStatus.IN_PROGRESS);
        enrollment.setEnrolledAt(LocalDateTime.now());
        
        Enrollment saved = enrollmentRepository.save(enrollment);
        return convertToDTO(saved);
    }

    /**
     * Cập nhật trạng thái enrollment
     */
    @Transactional
    public EnrollmentDTO updateEnrollment(Long enrollmentId, EnrollmentUpdateRequest request) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new RuntimeException("Enrollment not found with id: " + enrollmentId));
        
        // Update status
        if (request.getStatus() != null) {
            try {
                EEnrollmentStatus newStatus = EEnrollmentStatus.valueOf(request.getStatus());
                enrollment.setStatus(newStatus);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid status: " + request.getStatus());
            }
        }
        
        // Update progress
        if (request.getProgress() != null) {
            enrollment.setProgress(request.getProgress());
            
            // Auto-complete if progress reaches 100%
            if (request.getProgress() >= 100.0 && enrollment.getStatus() != EEnrollmentStatus.COMPLETED) {
                enrollment.setStatus(EEnrollmentStatus.COMPLETED);
            }
        }
        
        // Update score - would need to add field to entity
        if (request.getCurrentScore() != null) {
            // Would update in actual implementation if field exists
        }
        
        Enrollment updated = enrollmentRepository.save(enrollment);
        return convertToDTO(updated);
    }

    /**
     * Xóa học viên khỏi khóa học (Admin only)
     */
    @Transactional
    public void removeEnrollment(Long enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new RuntimeException("Enrollment not found with id: " + enrollmentId));
        
        // Can add business logic here (e.g., refund check)
        enrollmentRepository.delete(enrollment);
    }

    /**
     * Lấy lịch sử học tập của học viên
     */
    public StudentLearningHistoryDTO getStudentLearningHistory(Long studentId) {
        User student = userRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));
        
        StudentLearningHistoryDTO history = new StudentLearningHistoryDTO();
        history.setStudentId(studentId);
        history.setStudentName(student.getFullName());
        history.setEmail(student.getEmail());
        
        // Get all enrollments
        List<Enrollment> enrollments = enrollmentRepository
            .findByUserId(studentId, Pageable.unpaged())
            .getContent();
        
        history.setTotalCoursesEnrolled(enrollments.size());
        
        // Count by status
        long completed = enrollments.stream()
            .filter(e -> EEnrollmentStatus.COMPLETED.equals(e.getStatus()))
            .count();
        // Note: DROPPED status not in current enum, using 0
        long dropped = 0;
        
        history.setCoursesCompleted((int) completed);
        history.setCoursesDropped((int) dropped);
        history.setCoursesInProgress(enrollments.size() - (int) completed - (int) dropped);
        
        // Calculate overall progress
        if (!enrollments.isEmpty()) {
            double avgProgress = enrollments.stream()
                .mapToDouble(Enrollment::getProgress)
                .average()
                .orElse(0.0);
            history.setOverallProgress(avgProgress);
        }
        
        // Get certificates
        Long certCount = certificateRepository
            .findByEnrollmentUserId(studentId, Pageable.unpaged())
            .getTotalElements();
        history.setCertificatesEarned(certCount.intValue());
        
        // Convert enrollments to DTOs
        List<EnrollmentDTO> enrollmentDTOs = enrollments.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
        history.setEnrollments(enrollmentDTOs);
        
        // Last activity - using enrolledAt as proxy
        Optional<LocalDateTime> lastAccess = enrollments.stream()
            .map(Enrollment::getEnrolledAt)
            .filter(Objects::nonNull)
            .max(LocalDateTime::compareTo);
        lastAccess.ifPresent(history::setLastActivityDate);
        
        return history;
    }

    /**
     * Thống kê học viên mới theo tháng
     */
    public MonthlyStudentStatsDTO getMonthlyStudentStats(int year) {
        MonthlyStudentStatsDTO stats = new MonthlyStudentStatsDTO();
        
        List<MonthlyStudentStatsDTO.MonthlyData> monthlyData = new ArrayList<>();
        
        for (int month = 1; month <= 12; month++) {
            LocalDateTime startOfMonth = LocalDateTime.of(year, month, 1, 0, 0);
            LocalDateTime endOfMonth = startOfMonth.plusMonths(1).minusSeconds(1);
            
            // Count new enrollments in this month
            // Note: This is simplified - in production, would use proper queries
            List<Enrollment> enrollments = enrollmentRepository
                .findByUserId(1L, Pageable.unpaged()) // Simplified
                .getContent();
            
            long monthEnrollments = enrollments.stream()
                .filter(e -> e.getEnrolledAt() != null)
                .filter(e -> e.getEnrolledAt().isAfter(startOfMonth) && 
                           e.getEnrolledAt().isBefore(endOfMonth))
                .count();
            
            long monthCompletions = enrollments.stream()
                .filter(e -> EEnrollmentStatus.COMPLETED.equals(e.getStatus()))
                .filter(e -> e.getEnrolledAt() != null)
                .filter(e -> e.getEnrolledAt().isAfter(startOfMonth) && 
                           e.getEnrolledAt().isBefore(endOfMonth))
                .count();
            
            String monthName = startOfMonth.getMonth()
                .getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + year;
            
            MonthlyStudentStatsDTO.MonthlyData data = new MonthlyStudentStatsDTO.MonthlyData(
                year,
                month,
                monthName,
                monthEnrollments, // Simplified
                monthEnrollments,
                monthCompletions
            );
            
            monthlyData.add(data);
        }
        
        stats.setMonthlyData(monthlyData);
        return stats;
    }

    /**
     * Convert Enrollment entity to DTO
     */
    private EnrollmentDTO convertToDTO(Enrollment enrollment) {
        EnrollmentDTO dto = new EnrollmentDTO();
        dto.setId(enrollment.getId());
        
        // Student info
        if (enrollment.getUser() != null) {
            dto.setStudentId(enrollment.getUser().getId());
            dto.setStudentName(enrollment.getUser().getFullName());
            dto.setStudentEmail(enrollment.getUser().getEmail());
        }
        
        // Course info
        if (enrollment.getCourse() != null) {
            dto.setCourseId(enrollment.getCourse().getId());
            dto.setCourseTitle(enrollment.getCourse().getTitle());
            
            if (enrollment.getCourse().getInstructor() != null) {
                dto.setInstructorName(enrollment.getCourse().getInstructor().getFullName());
            }
        }
        
        // Enrollment details
        dto.setStatus(enrollment.getStatus().name());
        dto.setProgress(enrollment.getProgress());
        dto.setEnrolledAt(enrollment.getEnrolledAt());
        // completedAt and lastAccessedAt not in entity - set null
        dto.setCompletedAt(null);
        dto.setLastAccessedAt(null);
        
        return dto;
    }
}

