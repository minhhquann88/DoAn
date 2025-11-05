package com.coursemgmt.repository;

import com.coursemgmt.model.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    // Đếm số lượng học viên đăng ký
    Long countByCourseId(Long courseId);
}