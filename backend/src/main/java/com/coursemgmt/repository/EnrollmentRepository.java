package com.coursemgmt.repository;

import com.coursemgmt.model.Course;
import com.coursemgmt.model.Enrollment;
import com.coursemgmt.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    Long countByCourseId(Long courseId);

    // THÊM PHƯƠNG THỨC NÀY:
    Optional<Enrollment> findByUserAndCourse(User user, Course course);
}