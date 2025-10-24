package com.coursemgmt.service;

import com.coursemgmt.model.Course;
import com.coursemgmt.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service // Đánh dấu đây là tầng Service (nơi xử lý logic)
public class CourseService {

    // Tiêm (Inject) CourseRepository vào để sử dụng
    @Autowired
    private CourseRepository courseRepository;

    // CREATE
    public Course createCourse(Course course) {
        return courseRepository.save(course);
    }

    // READ (Get All)
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    // READ (Get by ID)
    public Optional<Course> getCourseById(Long id) {
        // Optional dùng để xử lý trường hợp không tìm thấy (tránh NullPointerException)
        return courseRepository.findById(id);
    }

    // UPDATE
    public Course updateCourse(Long id, Course courseDetails) {
        // 1. Tìm khóa học
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học với ID: " + id));

        // 2. Cập nhật thông tin
        course.setTitle(courseDetails.getTitle());
        course.setDescription(courseDetails.getDescription());
        course.setInstructor(courseDetails.getInstructor());
        course.setPrice(courseDetails.getPrice());

        // 3. Lưu lại
        return courseRepository.save(course);
    }

    // DELETE
    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học với ID: " + id));

        courseRepository.delete(course);
    }
}