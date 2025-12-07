package com.coursemgmt.repository;

import com.coursemgmt.model.Certificate;
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
public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    
    // Tìm theo certificate code
    Optional<Certificate> findByCertificateCode(String certificateCode);
    
    // Tìm theo enrollment
    Optional<Certificate> findByEnrollmentId(Long enrollmentId);
    
    // Tìm tất cả certificate của 1 user
    Page<Certificate> findByEnrollmentUserId(Long userId, Pageable pageable);
    
    // Tìm tất cả certificate của 1 course
    Page<Certificate> findByEnrollmentCourseId(Long courseId, Pageable pageable);
    
    // Đếm số certificate đã cấp theo khoảng thời gian
    @Query("SELECT COUNT(c) FROM Certificate c WHERE " +
           "c.issuedAt BETWEEN :startDate AND :endDate")
    Long countCertificatesByDateRange(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    // Thống kê certificate theo tháng
    @Query("SELECT MONTH(c.issuedAt) as month, COUNT(c) as total " +
           "FROM Certificate c WHERE YEAR(c.issuedAt) = :year " +
           "GROUP BY MONTH(c.issuedAt) ORDER BY month")
    List<Object[]> countCertificatesByMonth(@Param("year") int year);
    
    // Top courses có nhiều certificate nhất
    @Query("SELECT c.enrollment.course.id, c.enrollment.course.title, COUNT(c) as total " +
           "FROM Certificate c " +
           "GROUP BY c.enrollment.course.id, c.enrollment.course.title " +
           "ORDER BY total DESC")
    List<Object[]> findTopCertifiedCourses(Pageable pageable);
}

