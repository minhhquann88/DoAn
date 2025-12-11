package com.coursemgmt.repository;

import com.coursemgmt.model.Course;
import com.coursemgmt.model.Enrollment;
import com.coursemgmt.model.EEnrollmentStatus;
import com.coursemgmt.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    Long countByCourseId(Long courseId);
    Long countByStatus(EEnrollmentStatus status);

    Optional<Enrollment> findByUserAndCourse(User user, Course course);
    Optional<Enrollment> findByUserIdAndCourseId(Long userId, Long courseId);
    
    Page<Enrollment> findByCourseId(Long courseId, Pageable pageable);
    Page<Enrollment> findByUserId(Long userId, Pageable pageable);
}