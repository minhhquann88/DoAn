package com.coursemgmt.service;

import com.coursemgmt.model.*;
import com.coursemgmt.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminDashboardService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private TransactionRepository transactionRepository;
    

    /**
     * Lấy tổng quan stats cho admin dashboard
     */
    public Map<String, Object> getSummaryStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Tổng số User
        Long totalUsers = userRepository.count();
        stats.put("totalUsers", totalUsers);
        
        // Tổng số Khóa học
        Long totalCourses = courseRepository.count();
        stats.put("totalCourses", totalCourses);
        
        // Tổng Doanh thu (tất cả transactions SUCCESS)
        Double totalRevenue = transactionRepository.calculateRevenueByDateRange(
            LocalDateTime.of(2020, 1, 1, 0, 0),
            LocalDateTime.now()
        );
        stats.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);
        
        // Số giao dịch trong tháng
        LocalDateTime startOfMonth = LocalDateTime.now()
            .with(TemporalAdjusters.firstDayOfMonth())
            .withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfMonth = LocalDateTime.now();
        
        // Đếm số giao dịch thành công trong tháng hiện tại
        List<Transaction> allTransactions = transactionRepository.findAll();
        long monthlyTransactions = allTransactions.stream()
            .filter(t -> t.getStatus() == ETransactionStatus.SUCCESS)
            .filter(t -> t.getCreatedAt() != null && 
                        t.getCreatedAt().isAfter(startOfMonth) && 
                        t.getCreatedAt().isBefore(endOfMonth.plusDays(1)))
            .count();
        stats.put("monthlyTransactions", monthlyTransactions);
        
        return stats;
    }

    /**
     * Lấy doanh thu theo 12 tháng gần nhất
     */
    public List<Map<String, Object>> getRevenueChart() {
        List<Map<String, Object>> chartData = new ArrayList<>();
        
        LocalDateTime now = LocalDateTime.now();
        int currentYear = now.getYear();
        
        // Lấy doanh thu theo tháng
        List<Object[]> monthlyRevenue = transactionRepository.getMonthlyRevenue(currentYear);
        
        // Tạo map để dễ truy cập
        Map<Integer, Double> revenueMap = new HashMap<>();
        for (Object[] row : monthlyRevenue) {
            Integer month = (Integer) row[0];
            Double revenue = ((Number) row[2]).doubleValue();
            revenueMap.put(month, revenue);
        }
        
        // Tạo dữ liệu cho 12 tháng gần nhất
        for (int i = 11; i >= 0; i--) {
            LocalDateTime monthDate = now.minusMonths(i);
            int month = monthDate.getMonthValue();
            int year = monthDate.getYear();
            
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", month);
            monthData.put("year", year);
            monthData.put("monthName", getMonthName(month));
            monthData.put("revenue", revenueMap.getOrDefault(month, 0.0));
            
            chartData.add(monthData);
        }
        
        return chartData;
    }

    /**
     * Lấy top 5 khóa học bán chạy nhất
     */
    public List<Map<String, Object>> getTopSellingCourses() {
        List<Object[]> topCourses = transactionRepository.findTopSellingCourses(
            PageRequest.of(0, 5)
        );
        
        return topCourses.stream().map(row -> {
            Map<String, Object> courseData = new HashMap<>();
            courseData.put("courseId", row[0]);
            courseData.put("courseTitle", row[1]);
            courseData.put("totalSales", row[2]);
            
            // Lấy thêm thông tin course
            Long courseId = (Long) row[0];
            courseRepository.findById(courseId).ifPresent(course -> {
                courseData.put("price", course.getPrice());
                courseData.put("imageUrl", course.getImageUrl());
                if (course.getInstructor() != null) {
                    courseData.put("instructorName", course.getInstructor().getFullName());
                }
            });
            
            return courseData;
        }).collect(Collectors.toList());
    }

    private String getMonthName(int month) {
        String[] monthNames = {
            "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
            "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
        };
        return monthNames[month - 1];
    }
}

