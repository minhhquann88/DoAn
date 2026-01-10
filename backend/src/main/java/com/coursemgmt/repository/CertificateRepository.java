package com.coursemgmt.repository;

import com.coursemgmt.model.Certificate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    
    // Tìm theo certificate code
    Optional<Certificate> findByCertificateCode(String certificateCode);
    
    // Tìm theo enrollment
    Optional<Certificate> findByEnrollmentId(Long enrollmentId);
    
    // Kiểm tra certificate đã tồn tại cho enrollment
    boolean existsByEnrollmentId(Long enrollmentId);
    
    // Tìm tất cả certificate của 1 user
    @Query("SELECT c FROM Certificate c WHERE c.enrollment.user.id = :userId")
    Page<Certificate> findByEnrollmentUserId(@Param("userId") Long userId, Pageable pageable);
    
    // Tìm tất cả certificate của 1 course
    @Query("SELECT c FROM Certificate c WHERE c.enrollment.course.id = :courseId")
    Page<Certificate> findByEnrollmentCourseId(@Param("courseId") Long courseId, Pageable pageable);
    
    // Fetch certificate with enrollment and related entities (for PDF generation)
    @Query("SELECT c FROM Certificate c " +
           "LEFT JOIN FETCH c.enrollment e " +
           "LEFT JOIN FETCH e.user " +
           "LEFT JOIN FETCH e.course co " +
           "LEFT JOIN FETCH co.instructor " +
           "WHERE c.id = :id")
    Optional<Certificate> findByIdWithEnrollment(@Param("id") Long id);
    
    // Fetch certificate by code with enrollment and related entities
    @Query("SELECT c FROM Certificate c " +
           "LEFT JOIN FETCH c.enrollment e " +
           "LEFT JOIN FETCH e.user " +
           "LEFT JOIN FETCH e.course co " +
           "LEFT JOIN FETCH co.instructor " +
           "WHERE c.certificateCode = :code")
    Optional<Certificate> findByCertificateCodeWithEnrollment(@Param("code") String code);
}

