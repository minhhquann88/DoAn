package com.coursemgmt.repository;

import com.coursemgmt.model.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    // Tìm theo user
    Page<Transaction> findByUserId(Long userId, Pageable pageable);
    
    // Tìm theo course
    Page<Transaction> findByCourseId(Long courseId, Pageable pageable);
    
    // Tìm theo transaction code
    Optional<Transaction> findByTransactionCode(String transactionCode);
    
    // Tìm theo status
    Page<Transaction> findByStatus(String status, Pageable pageable);
    
    // Đếm theo status
    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.status = :status")
    Long countByStatus(@Param("status") String status);
    
    // Tìm giao dịch của user cho 1 course cụ thể
    Optional<Transaction> findByUserIdAndCourseIdAndStatus(
        Long userId, 
        Long courseId, 
        String status
    );
    
    // Thống kê doanh thu theo khoảng thời gian
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE " +
           "t.status = 'SUCCESS' AND " +
           "t.createdAt BETWEEN :startDate AND :endDate")
    Double calculateRevenueByDateRange(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    // Đếm số giao dịch thành công
    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.status = 'SUCCESS'")
    Long countSuccessfulTransactions();
    
    // Top courses bán chạy
    @Query("SELECT t.course.id, t.course.title, COUNT(t) as total " +
           "FROM Transaction t WHERE t.status = 'SUCCESS' " +
           "GROUP BY t.course.id, t.course.title " +
           "ORDER BY total DESC")
    List<Object[]> findTopSellingCourses(Pageable pageable);
    
    // Doanh thu theo tháng
    @Query("SELECT MONTH(t.createdAt) as month, " +
           "YEAR(t.createdAt) as year, " +
           "SUM(t.amount) as revenue, " +
           "COUNT(t) as transactions " +
           "FROM Transaction t " +
           "WHERE t.status = 'SUCCESS' AND YEAR(t.createdAt) = :year " +
           "GROUP BY MONTH(t.createdAt), YEAR(t.createdAt) " +
           "ORDER BY month")
    List<Object[]> getMonthlyRevenue(@Param("year") int year);
}
