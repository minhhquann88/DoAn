package com.coursemgmt.repository;

import com.coursemgmt.model.Course;
import com.coursemgmt.model.Enrollment;
import com.coursemgmt.model.EEnrollmentStatus;
import com.coursemgmt.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    Long countByCourseId(Long courseId);
    Long countByStatus(EEnrollmentStatus status);

    Optional<Enrollment> findByUserAndCourse(User user, Course course);
    Optional<Enrollment> findByUserIdAndCourseId(Long userId, Long courseId);
    
    // Check if enrollment exists (for duplicate prevention)
    boolean existsByUserIdAndCourseId(Long userId, Long courseId);
    
    // Fetch all enrolled course IDs for a user efficiently (for batch checking)
    @Query("SELECT e.course.id FROM Enrollment e WHERE e.user.id = :userId")
    Set<Long> findEnrolledCourseIdsByUserId(@Param("userId") Long userId);
    
    Page<Enrollment> findByCourseId(Long courseId, Pageable pageable);
    Page<Enrollment> findByUserId(Long userId, Pageable pageable);
    
    // Fetch enrollments with course and instructor (JOIN FETCH to avoid LazyInitializationException)
    @Query("SELECT DISTINCT e FROM Enrollment e " +
           "LEFT JOIN FETCH e.course c " +
           "LEFT JOIN FETCH c.instructor " +
           "LEFT JOIN FETCH c.category " +
           "WHERE e.user.id = :userId")
    List<Enrollment> findByUserIdWithCourse(@Param("userId") Long userId);
}