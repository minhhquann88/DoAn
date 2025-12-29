package com.coursemgmt.repository;

import com.coursemgmt.model.*; // Đổi User_Progress nếu tên file của bạn khác
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

@Repository
public interface UserProgressRepository extends JpaRepository<User_Progress, Long> {
    Optional<User_Progress> findByEnrollmentAndLesson(Enrollment enrollment, Lesson lesson);

    // Đếm số bài đã học trong 1 enrollment
    long countByEnrollmentAndIsCompleted(Enrollment enrollment, boolean isCompleted);

    // Lấy tất cả progress của 1 enrollment (không JOIN FETCH - có thể gặp LazyInitializationException)
    Set<User_Progress> findByEnrollment(Enrollment enrollment);
    
    // Lấy tất cả progress của 1 enrollment với lesson được load sẵn (JOIN FETCH)
    @Query("SELECT DISTINCT up FROM User_Progress up " +
           "LEFT JOIN FETCH up.lesson " +
           "WHERE up.enrollment = :enrollment")
    Set<User_Progress> findByEnrollmentWithLesson(@Param("enrollment") Enrollment enrollment);
}