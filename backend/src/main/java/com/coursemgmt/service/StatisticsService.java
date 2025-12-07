package com.coursemgmt.service;

import com.coursemgmt.dto.*;
import com.coursemgmt.model.*;
import com.coursemgmt.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StatisticsService {

    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EnrollmentRepository enrollmentRepository;
    
    @Autowired
    private TransactionRepository transactionRepository;
    
    @Autowired
    private CertificateRepository certificateRepository;

    /**
     * Lấy tổng quan dashboard cho admin
     */
    public DashboardStatsDTO getDashboardStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();
        
        // Đếm tổng số
        stats.setTotalCourses(courseRepository.count());
        stats.setTotalStudents(countStudents());
        stats.setTotalInstructors(countInstructors());
        stats.setTotalEnrollments(enrollmentRepository.count());
        stats.setTotalCertificates(certificateRepository.count());
        
        // Doanh thu
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.with(TemporalAdjusters.firstDayOfMonth()).withHour(0).withMinute(0);
        LocalDateTime startOfYear = now.with(TemporalAdjusters.firstDayOfYear()).withHour(0).withMinute(0);
        
        stats.setTotalRevenue(calculateTotalRevenue());
        stats.setMonthlyRevenue(transactionRepository.calculateRevenueByDateRange(startOfMonth, now));
        stats.setYearlyRevenue(transactionRepository.calculateRevenueByDateRange(startOfYear, now));
        
        // Khóa học theo status
        stats.setActiveCourses(courseRepository.countByStatus("PUBLISHED"));
        stats.setPendingCourses(courseRepository.countByStatus("PENDING_APPROVAL"));
        stats.setDraftCourses(courseRepository.countByStatus("DRAFT"));
        
        // Giao dịch theo status
        stats.setSuccessfulTransactions(transactionRepository.countByStatus("SUCCESS"));
        stats.setPendingTransactions(transactionRepository.countByStatus("PENDING"));
        stats.setFailedTransactions(transactionRepository.countByStatus("FAILED"));
        
        // Tỷ lệ hoàn thành
        Long totalEnrollments = enrollmentRepository.count();
        Long completedEnrollments = enrollmentRepository.countByStatus("COMPLETED");
        
        stats.setCompletedEnrollments(completedEnrollments);
        stats.setInProgressEnrollments(totalEnrollments - completedEnrollments);
        
        if (totalEnrollments > 0) {
            stats.setAverageCompletionRate(
                (completedEnrollments * 100.0) / totalEnrollments
            );
        }
        
        return stats;
    }

    /**
     * Thống kê chi tiết 1 khóa học
     */
    public CourseStatsDTO getCourseStats(Long courseId) {
        CourseStatsDTO stats = new CourseStatsDTO();
        
        // Basic info
        courseRepository.findById(courseId).ifPresent(course -> {
            stats.setCourseId(course.getId());
            stats.setCourseTitle(course.getTitle());
            if (course.getInstructor() != null) {
                stats.setInstructorName(course.getInstructor().getFullName());
            }
        });
        
        // Enrollments
        Long totalEnrollments = enrollmentRepository.countByCourseId(courseId);
        stats.setTotalEnrollments(totalEnrollments);
        
        // Get all enrollments for this course
        List<Enrollment> enrollments = enrollmentRepository
            .findByCourseId(courseId, org.springframework.data.domain.Pageable.unpaged())
            .getContent();
        
        long completed = enrollments.stream()
            .filter(e -> e.getProgress() >= 100.0)
            .count();
        
        stats.setCompletedStudents(completed);
        stats.setActiveStudents(totalEnrollments - completed);
        
        // Completion rate
        if (totalEnrollments > 0) {
            stats.setCompletionRate((completed * 100.0) / totalEnrollments);
            
            // Average progress
            double avgProgress = enrollments.stream()
                .mapToDouble(Enrollment::getProgress)
                .average()
                .orElse(0.0);
            stats.setAverageProgress(avgProgress);
        }
        
        // Certificates
        Long certificates = certificateRepository
            .findByEnrollmentCourseId(courseId, org.springframework.data.domain.Pageable.unpaged())
            .getTotalElements();
        stats.setCertificatesIssued(certificates);
        
        // Revenue
        List<Transaction> transactions = transactionRepository
            .findByCourseId(courseId, org.springframework.data.domain.Pageable.unpaged())
            .getContent();
        
        double revenue = transactions.stream()
            .filter(t -> "SUCCESS".equals(t.getStatus().toString()))
            .mapToDouble(Transaction::getAmount)
            .sum();
        
        stats.setTotalRevenue(revenue);
        stats.setTotalTransactions((long) transactions.size());
        
        return stats;
    }

    /**
     * Thống kê giảng viên
     */
    public InstructorStatsDTO getInstructorStats(Long instructorId) {
        InstructorStatsDTO stats = new InstructorStatsDTO();
        
        // Basic info
        userRepository.findById(instructorId).ifPresent(user -> {
            stats.setInstructorId(user.getId());
            stats.setInstructorName(user.getFullName());
            stats.setEmail(user.getEmail());
        });
        
        // Courses
        List<Course> courses = courseRepository.findByInstructorId(instructorId);
        stats.setTotalCourses((long) courses.size());
        
        long published = courses.stream()
            .filter(c -> "PUBLISHED".equals(c.getStatus().toString()))
            .count();
        stats.setPublishedCourses(published);
        stats.setDraftCourses(courses.size() - published);
        
        // Students & Revenue
        Set<Long> uniqueStudents = new HashSet<>();
        double totalRevenue = 0.0;
        long totalCertificates = 0;
        
        for (Course course : courses) {
            // Students
            List<Enrollment> enrollments = enrollmentRepository
                .findByCourseId(course.getId(), org.springframework.data.domain.Pageable.unpaged())
                .getContent();
            
            enrollments.forEach(e -> uniqueStudents.add(e.getUser().getId()));
            
            // Revenue
            List<Transaction> transactions = transactionRepository
                .findByCourseId(course.getId(), org.springframework.data.domain.Pageable.unpaged())
                .getContent();
            
            totalRevenue += transactions.stream()
                .filter(t -> "SUCCESS".equals(t.getStatus().toString()))
                .mapToDouble(Transaction::getAmount)
                .sum();
            
            // Certificates
            totalCertificates += certificateRepository
                .findByEnrollmentCourseId(course.getId(), org.springframework.data.domain.Pageable.unpaged())
                .getTotalElements();
        }
        
        stats.setTotalStudents((long) uniqueStudents.size());
        stats.setActiveStudents((long) uniqueStudents.size()); // Simplified
        stats.setTotalRevenue(totalRevenue);
        stats.setCertificatesIssued(totalCertificates);
        
        return stats;
    }

    /**
     * Thống kê học viên
     */
    public StudentStatsDTO getStudentStats(Long studentId) {
        StudentStatsDTO stats = new StudentStatsDTO();
        
        // Basic info
        userRepository.findById(studentId).ifPresent(user -> {
            stats.setStudentId(user.getId());
            stats.setStudentName(user.getFullName());
            stats.setEmail(user.getEmail());
        });
        
        // Enrollments
        List<Enrollment> enrollments = enrollmentRepository
            .findByUserId(studentId, org.springframework.data.domain.Pageable.unpaged())
            .getContent();
        
        stats.setTotalEnrollments((long) enrollments.size());
        
        long completed = enrollments.stream()
            .filter(e -> e.getProgress() >= 100.0)
            .count();
        
        stats.setCompletedCourses(completed);
        stats.setInProgressCourses(enrollments.size() - completed);
        
        // Progress
        if (!enrollments.isEmpty()) {
            double avgProgress = enrollments.stream()
                .mapToDouble(Enrollment::getProgress)
                .average()
                .orElse(0.0);
            stats.setAverageProgress(avgProgress);
            
            if (enrollments.size() > 0) {
                stats.setCompletionRate((completed * 100.0) / enrollments.size());
            }
        }
        
        // Certificates
        Long certificates = certificateRepository
            .findByEnrollmentUserId(studentId, org.springframework.data.domain.Pageable.unpaged())
            .getTotalElements();
        stats.setTotalCertificates(certificates);
        
        return stats;
    }

    /**
     * Báo cáo doanh thu
     */
    public RevenueStatsDTO getRevenueReport(LocalDateTime startDate, LocalDateTime endDate) {
        RevenueStatsDTO report = new RevenueStatsDTO();
        
        report.setStartDate(startDate.toLocalDate());
        report.setEndDate(endDate.toLocalDate());
        
        // Total revenue
        Double totalRevenue = transactionRepository.calculateRevenueByDateRange(startDate, endDate);
        report.setTotalRevenue(totalRevenue != null ? totalRevenue : 0.0);
        
        // Total transactions
        Long totalTxs = transactionRepository.countSuccessfulTransactions();
        report.setTotalTransactions(totalTxs);
        
        if (totalTxs > 0 && totalRevenue != null) {
            report.setAverageTransactionValue(totalRevenue / totalTxs);
        }
        
        // Top selling courses
        List<Object[]> topCourses = transactionRepository.findTopSellingCourses(
            org.springframework.data.domain.PageRequest.of(0, 10)
        );
        
        List<RevenueStatsDTO.TopSellingCourseDTO> topSellingList = topCourses.stream()
            .map(obj -> new RevenueStatsDTO.TopSellingCourseDTO(
                (Long) obj[0],      // courseId
                (String) obj[1],    // courseTitle
                (Long) obj[2],      // totalSales
                0.0                 // revenue - would need separate query
            ))
            .collect(Collectors.toList());
        
        report.setTopSellingCourses(topSellingList);
        
        return report;
    }

    /**
     * Báo cáo tỷ lệ hoàn thành
     */
    public CompletionReportDTO getCompletionReport() {
        CompletionReportDTO report = new CompletionReportDTO();
        
        // Overall stats
        Long totalEnrollments = enrollmentRepository.count();
        Long completedEnrollments = enrollmentRepository.countByStatus("COMPLETED");
        
        report.setTotalEnrollments(totalEnrollments);
        report.setCompletedEnrollments(completedEnrollments);
        report.setInProgressEnrollments(totalEnrollments - completedEnrollments);
        
        if (totalEnrollments > 0) {
            report.setOverallCompletionRate(
                (completedEnrollments * 100.0) / totalEnrollments
            );
        }
        
        // By course
        List<Course> courses = courseRepository.findAll();
        List<CompletionReportDTO.CourseCompletionDTO> courseCompletions = courses.stream()
            .map(course -> {
                List<Enrollment> enrollments = enrollmentRepository
                    .findByCourseId(course.getId(), org.springframework.data.domain.Pageable.unpaged())
                    .getContent();
                
                long total = enrollments.size();
                long completed = enrollments.stream()
                    .filter(e -> e.getProgress() >= 100.0)
                    .count();
                
                double avgProgress = enrollments.stream()
                    .mapToDouble(Enrollment::getProgress)
                    .average()
                    .orElse(0.0);
                
                double completionRate = total > 0 ? (completed * 100.0) / total : 0.0;
                
                return new CompletionReportDTO.CourseCompletionDTO(
                    course.getId(),
                    course.getTitle(),
                    total,
                    completed,
                    completionRate,
                    avgProgress
                );
            })
            .collect(Collectors.toList());
        
        report.setCourseCompletions(courseCompletions);
        
        return report;
    }

    // Helper methods
    
    private Long countStudents() {
        // Count users with STUDENT role
        // Simplified - would need Role join
        return userRepository.count();
    }
    
    private Long countInstructors() {
        // Count users with INSTRUCTOR role
        // Simplified - would need Role join
        return courseRepository.countDistinctInstructors();
    }
    
    private Double calculateTotalRevenue() {
        LocalDateTime beginning = LocalDateTime.of(2020, 1, 1, 0, 0);
        LocalDateTime now = LocalDateTime.now();
        return transactionRepository.calculateRevenueByDateRange(beginning, now);
    }
}

