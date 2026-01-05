package com.coursemgmt.service;

import com.coursemgmt.dto.InstructorDashboardStatsDTO;
import com.coursemgmt.dto.InstructorCourseDTO;
import com.coursemgmt.dto.InstructorChartDataDTO;
import com.coursemgmt.dto.InstructorEarningsDTO;
import com.coursemgmt.dto.InstructorStudentDTO;
import com.coursemgmt.model.Course;
import com.coursemgmt.model.ECourseStatus;
import com.coursemgmt.model.ETransactionStatus;
import com.coursemgmt.model.Transaction;
import com.coursemgmt.model.Enrollment;
import com.coursemgmt.model.User_Progress;
import com.coursemgmt.repository.CourseRepository;
import com.coursemgmt.repository.EnrollmentRepository;
import com.coursemgmt.repository.ReviewRepository;
import com.coursemgmt.repository.TransactionRepository;
import com.coursemgmt.repository.UserProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class InstructorDashboardService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private TransactionRepository transactionRepository;
    
    @Autowired
    private UserProgressRepository userProgressRepository;
    
    @Autowired
    private ReviewRepository reviewRepository;

    /**
     * Lấy thống kê tổng quan cho Instructor Dashboard
     */
    @Transactional(readOnly = true)
    public InstructorDashboardStatsDTO getDashboardStats(Long instructorId) {
        // 1. Tổng số khóa học của instructor
        List<Course> instructorCourses = courseRepository.findByInstructorId(instructorId);
        Long totalCourses = (long) instructorCourses.size();

        // 2. Tổng số học viên đã đăng ký (tính từ enrollments của tất cả courses)
        Long totalStudents = 0L;
        for (Course course : instructorCourses) {
            Long enrollments = enrollmentRepository.countByCourseId(course.getId());
            totalStudents += (enrollments != null ? enrollments : 0L);
        }

        // 3. Tổng doanh thu (từ transactions thành công của tất cả courses)
        Double totalEarnings = transactionRepository.calculateRevenueByInstructor(instructorId);
        if (totalEarnings == null) {
            totalEarnings = 0.0;
        }

        // 4. Đánh giá trung bình (từ tất cả reviews của các khóa học)
        Double averageRating = reviewRepository.getAverageRatingByInstructorId(instructorId);
        if (averageRating == null) {
            averageRating = 0.0;
        }

        return new InstructorDashboardStatsDTO(totalCourses, totalStudents, totalEarnings, averageRating);
    }

    /**
     * Lấy danh sách khóa học của Instructor
     */
    @Transactional(readOnly = true)
    public List<InstructorCourseDTO> getMyCourses(Long instructorId) {
        List<Course> courses = courseRepository.findByInstructorId(instructorId);
        
        return courses.stream().map(course -> {
            InstructorCourseDTO dto = new InstructorCourseDTO();
            dto.setId(course.getId());
            dto.setTitle(course.getTitle());
            dto.setDescription(course.getDescription());
            dto.setPrice(course.getPrice());
            dto.setImageUrl(course.getImageUrl());
            dto.setIsPublished(course.getIsPublished() != null ? course.getIsPublished() : false);
            dto.setStatus(course.getStatus() != null ? course.getStatus().name() : ECourseStatus.DRAFT.name());
            dto.setCreatedAt(course.getCreatedAt());
            dto.setUpdatedAt(course.getUpdatedAt());
            
            // Tính số lượng học viên - đếm tất cả enrollments của course này
            Long studentsCount = enrollmentRepository.countByCourseId(course.getId());
            
            // Đảm bảo không null (countByCourseId có thể trả về null nếu không có enrollment)
            if (studentsCount == null) {
                studentsCount = 0L;
            }
            
            dto.setStudentsCount(studentsCount);
            dto.setEnrollmentCount(studentsCount); // Set enrollmentCount for consistency with CourseResponse
            
            // Debug log để kiểm tra
            System.out.println(">>> Course ID: " + course.getId() + ", Title: " + course.getTitle() + 
                ", Enrollment Count: " + studentsCount);
            
            return dto;
        }).collect(Collectors.toList());
    }

    /**
     * Lấy dữ liệu charts cho Dashboard (6 tháng gần nhất)
     */
    @Transactional(readOnly = true)
    public InstructorChartDataDTO getChartData(Long instructorId) {
        LocalDateTime now = LocalDateTime.now();
        List<Course> instructorCourses = courseRepository.findByInstructorId(instructorId);
        
        // Lấy danh sách course IDs
        List<Long> courseIds = instructorCourses.stream()
                .map(Course::getId)
                .collect(Collectors.toList());

        // Tạo dữ liệu cho 6 tháng gần nhất
        List<InstructorChartDataDTO.MonthlyData> earningsData = new ArrayList<>();
        List<InstructorChartDataDTO.MonthlyData> enrollmentsData = new ArrayList<>();
        
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("'Tháng' M", Locale.forLanguageTag("vi-VN"));
        
        for (int i = 5; i >= 0; i--) {
            LocalDateTime monthStart = now.minusMonths(i).with(TemporalAdjusters.firstDayOfMonth())
                    .withHour(0).withMinute(0).withSecond(0).withNano(0);
            LocalDateTime monthEnd = monthStart.with(TemporalAdjusters.lastDayOfMonth())
                    .withHour(23).withMinute(59).withSecond(59).withNano(999999999);
            
            String monthLabel = monthStart.format(monthFormatter);
            
            // Tính doanh thu trong tháng này (từ transactions thành công)
            List<Transaction> monthlyTransactions = transactionRepository
                    .findSuccessfulTransactionsByInstructorAndDateRange(instructorId, monthStart, monthEnd);
            
            Double monthlyEarnings = monthlyTransactions.stream()
                    .mapToDouble(t -> t.getAmount() != null ? t.getAmount() : 0.0)
                    .sum();
            
            earningsData.add(new InstructorChartDataDTO.MonthlyData(monthLabel, monthlyEarnings));
            
            // Tính số lượng đăng ký trong tháng này (sử dụng query tối ưu)
            Long monthlyEnrollments = enrollmentRepository.countEnrollmentsByInstructorAndDateRange(
                instructorId, monthStart, monthEnd
            );
            if (monthlyEnrollments == null) {
                monthlyEnrollments = 0L;
            }
            
            enrollmentsData.add(new InstructorChartDataDTO.MonthlyData(monthLabel, monthlyEnrollments.doubleValue()));
        }
        
        return new InstructorChartDataDTO(earningsData, enrollmentsData);
    }
    
    /**
     * Lấy dữ liệu doanh thu chi tiết cho trang Doanh thu
     */
    @Transactional(readOnly = true)
    public InstructorEarningsDTO getEarnings(Long instructorId) {
        // 1. Tổng doanh thu (từ transactions thành công)
        Double totalRevenue = transactionRepository.calculateRevenueByInstructor(instructorId);
        if (totalRevenue == null) {
            totalRevenue = 0.0;
        }
        
        // 2. Đang chờ thanh toán (từ transactions PENDING)
        List<Course> instructorCourses = courseRepository.findByInstructorId(instructorId);
        List<Long> courseIds = instructorCourses.stream()
                .map(Course::getId)
                .collect(Collectors.toList());
        
        Double pendingBalance = 0.0;
        if (!courseIds.isEmpty()) {
            List<Transaction> pendingTransactions = transactionRepository.findAll()
                    .stream()
                    .filter(t -> t.getCourse() != null && courseIds.contains(t.getCourse().getId()))
                    .filter(t -> t.getStatus() == ETransactionStatus.PENDING)
                    .collect(Collectors.toList());
            
            pendingBalance = pendingTransactions.stream()
                    .mapToDouble(t -> t.getAmount() != null ? t.getAmount() : 0.0)
                    .sum();
        }
        
        // 3. Có thể rút = Tổng doanh thu - Đang chờ
        Double availableBalance = totalRevenue - pendingBalance;
        if (availableBalance < 0) {
            availableBalance = 0.0;
        }
        
        // 4. Tính tăng trưởng (so sánh tháng đầu và tháng cuối trong 6 tháng gần nhất)
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime firstMonthStart = now.minusMonths(5).with(TemporalAdjusters.firstDayOfMonth())
                .withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime firstMonthEnd = firstMonthStart.with(TemporalAdjusters.lastDayOfMonth())
                .withHour(23).withMinute(59).withSecond(59).withNano(999999999);
        
        LocalDateTime lastMonthStart = now.minusMonths(0).with(TemporalAdjusters.firstDayOfMonth())
                .withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime lastMonthEnd = lastMonthStart.with(TemporalAdjusters.lastDayOfMonth())
                .withHour(23).withMinute(59).withSecond(59).withNano(999999999);
        
        List<Transaction> firstMonthTransactions = transactionRepository
                .findSuccessfulTransactionsByInstructorAndDateRange(instructorId, firstMonthStart, firstMonthEnd);
        Double firstMonthRevenue = firstMonthTransactions.stream()
                .mapToDouble(t -> t.getAmount() != null ? t.getAmount() : 0.0)
                .sum();
        
        List<Transaction> lastMonthTransactions = transactionRepository
                .findSuccessfulTransactionsByInstructorAndDateRange(instructorId, lastMonthStart, lastMonthEnd);
        Double lastMonthRevenue = lastMonthTransactions.stream()
                .mapToDouble(t -> t.getAmount() != null ? t.getAmount() : 0.0)
                .sum();
        
        Double growthRate = 0.0;
        if (firstMonthRevenue > 0) {
            growthRate = ((lastMonthRevenue - firstMonthRevenue) / firstMonthRevenue) * 100.0;
        } else if (lastMonthRevenue > 0) {
            growthRate = 100.0; // Tăng từ 0 lên có doanh thu
        }
        
        // 5. Lấy giao dịch gần đây (10 giao dịch mới nhất)
        List<Transaction> allTransactions = transactionRepository
                .findByInstructorIdOrderByCreatedAtDesc(instructorId)
                .stream()
                .limit(10)
                .collect(Collectors.toList());
        
        List<InstructorEarningsDTO.TransactionDTO> recentTransactions = allTransactions.stream()
                .map(t -> {
                    InstructorEarningsDTO.TransactionDTO dto = new InstructorEarningsDTO.TransactionDTO();
                    dto.setId(t.getId());
                    dto.setCourseTitle(t.getCourse() != null ? t.getCourse().getTitle() : "N/A");
                    dto.setStudentName(t.getUser() != null ? t.getUser().getFullName() : "N/A");
                    dto.setAmount(t.getAmount() != null ? t.getAmount() : 0.0);
                    dto.setDate(t.getCreatedAt() != null ? 
                            t.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "N/A");
                    dto.setStatus(t.getStatus() == ETransactionStatus.SUCCESS ? "completed" : 
                                 t.getStatus() == ETransactionStatus.PENDING ? "pending" : "failed");
                    return dto;
                })
                .collect(Collectors.toList());
        
        return new InstructorEarningsDTO(
            totalRevenue,
            availableBalance,
            pendingBalance,
            growthRate,
            recentTransactions
        );
    }
    
    /**
     * Lấy danh sách học viên đã đăng ký các khóa học của Instructor
     */
    @Transactional(readOnly = true)
    public List<InstructorStudentDTO> getStudents(Long instructorId) {
        // Lấy tất cả courses của instructor
        List<Course> instructorCourses = courseRepository.findByInstructorId(instructorId);
        List<Long> courseIds = instructorCourses.stream()
                .map(Course::getId)
                .collect(Collectors.toList());
        
        if (courseIds.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Lấy tất cả enrollments của các courses này (sử dụng query tối ưu)
        List<Enrollment> enrollments = enrollmentRepository.findByInstructorIdWithDetails(instructorId);
        
        // Convert sang DTO
        return enrollments.stream().map(enrollment -> {
            InstructorStudentDTO dto = new InstructorStudentDTO();
            dto.setEnrollmentId(enrollment.getId());
            dto.setStudentId(enrollment.getUser().getId());
            dto.setStudentName(enrollment.getUser().getFullName() != null ? 
                    enrollment.getUser().getFullName() : enrollment.getUser().getUsername());
            dto.setStudentEmail(enrollment.getUser().getEmail());
            dto.setCourseId(enrollment.getCourse().getId());
            dto.setCourseTitle(enrollment.getCourse().getTitle());
            dto.setProgress(enrollment.getProgress() != null ? enrollment.getProgress() : 0.0);
            dto.setEnrolledAt(enrollment.getEnrolledAt());
            dto.setStatus(enrollment.getStatus() != null ? enrollment.getStatus().name() : "IN_PROGRESS");
            
            // Lấy lastActive từ User_Progress mới nhất
            LocalDateTime lastActive = null;
            if (enrollment.getProgresses() != null && !enrollment.getProgresses().isEmpty()) {
                lastActive = enrollment.getProgresses().stream()
                        .filter(p -> p.getCompletedAt() != null)
                        .map(User_Progress::getCompletedAt)
                        .max(LocalDateTime::compareTo)
                        .orElse(null);
            }
            
            // Nếu không có completedAt, lấy enrolledAt
            if (lastActive == null) {
                lastActive = enrollment.getEnrolledAt();
            }
            
            dto.setLastActive(lastActive);
            
            return dto;
        }).collect(Collectors.toList());
    }
}

