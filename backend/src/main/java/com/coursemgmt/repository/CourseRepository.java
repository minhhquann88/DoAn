package com.coursemgmt.repository;

import com.coursemgmt.model.Course;
import com.coursemgmt.model.ECourseStatus;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long>, JpaSpecificationExecutor<Course> {

    List<Course> findByInstructorId(Long instructorId);
    
    Long countByStatus(ECourseStatus status);
    
    @Query("SELECT COUNT(DISTINCT c.instructor.id) FROM Course c")
    Long countDistinctInstructors();

    // Tạo Specification để lọc theo tiêu đề (keyword)
    static Specification<Course> titleContains(String keyword) {
        return (course, cq, cb) -> cb.like(course.get("title"), "%" + keyword + "%");
    }

    // Tạo Specification để lọc theo categoryId
    static Specification<Course> hasCategory(Long categoryId) {
        return (course, cq, cb) -> cb.equal(course.get("category").get("id"), categoryId);
    }

    // Tạo Specification để lọc các khóa học đã PUBLISHED
    static Specification<Course> isPublished() {
        return (course, cq, cb) -> cb.equal(course.get("status"), ECourseStatus.PUBLISHED);
    }
}