package com.coursemgmt.repository;

import com.coursemgmt.model.Course;
import com.coursemgmt.model.ECourseStatus;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.domain.Pageable;
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
    
    // Tìm các khóa học nổi bật (featured) và đã published - sử dụng @Query explicit để tránh naming convention issues
    @Query("SELECT c FROM Course c WHERE c.isFeatured = true AND c.isPublished = true AND c.status = 'PUBLISHED' ORDER BY c.createdAt DESC")
    List<Course> findFeaturedCourses();
    
    // Tìm các khóa học mới nhất đã published - sử dụng @Query explicit
    @Query("SELECT c FROM Course c WHERE c.isPublished = true AND c.status = 'PUBLISHED' ORDER BY c.createdAt DESC")
    List<Course> findLatestPublishedCourses(Pageable pageable);

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

    // Tạo Specification để lọc theo giá (Free: price = 0, Paid: price > 0)
    static Specification<Course> priceRange(Double minPrice, Double maxPrice) {
        return (course, cq, cb) -> {
            if (minPrice != null && maxPrice != null) {
                return cb.between(course.get("price"), minPrice, maxPrice);
            } else if (minPrice != null) {
                return cb.greaterThanOrEqualTo(course.get("price"), minPrice);
            } else if (maxPrice != null) {
                return cb.lessThanOrEqualTo(course.get("price"), maxPrice);
            }
            return null; // No price filter
        };
    }

    // Tạo Specification để lọc khóa học miễn phí (price = 0)
    static Specification<Course> isFree() {
        return (course, cq, cb) -> cb.equal(course.get("price"), 0.0);
    }

    // Tạo Specification để lọc khóa học có phí (price > 0)
    static Specification<Course> isPaid() {
        return (course, cq, cb) -> cb.greaterThan(course.get("price"), 0.0);
    }

    // Tạo Specification để lọc theo level
    // Note: Course entity currently doesn't have a 'level' field
    // This specification will be implemented when level field is added to Course entity
    // For now, returning null (no filter) to avoid errors
    static Specification<Course> hasLevel(String level) {
        // TODO: Implement level filtering when Course entity has level field
        // return (course, cq, cb) -> cb.equal(course.get("level"), level);
        return null; // No filter until level field is added to Course entity
    }
}