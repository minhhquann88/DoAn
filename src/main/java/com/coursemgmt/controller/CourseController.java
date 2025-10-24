package com.coursemgmt.controller;

import com.coursemgmt.model.Course;
import com.coursemgmt.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // Đánh dấu đây là 1 REST Controller (trả về JSON)
@RequestMapping("/api/v1/courses") // Tiền tố chung cho tất cả API trong class này
public class CourseController {

    @Autowired
    private CourseService courseService;

    // 1. API tạo mới khóa học (CREATE)
    // URL: POST http://localhost:8080/api/v1/courses
    @PostMapping
    public Course createCourse(@RequestBody Course course) {
        return courseService.createCourse(course);
    }

    // 2. API lấy tất cả khóa học (READ)
    // URL: GET http://localhost:8080/api/v1/courses
    @GetMapping
    public List<Course> getAllCourses() {
        return courseService.getAllCourses();
    }

    // 3. API lấy 1 khóa học theo ID (READ)
    // URL: GET http://localhost:8080/api/v1/courses/1 (ví dụ 1 là id)
    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long id) {
        return courseService.getCourseById(id)
                .map(ResponseEntity::ok) // Nếu tìm thấy, trả về 200 OK
                .orElse(ResponseEntity.notFound().build()); // Nếu không, trả về 404 Not Found
    }

    // 4. API cập nhật khóa học (UPDATE)
    // URL: PUT http://localhost:8080/api/v1/courses/1
    @PutMapping("/{id}")
    public ResponseEntity<Course> updateCourse(@PathVariable Long id, @RequestBody Course courseDetails) {
        try {
            Course updatedCourse = courseService.updateCourse(id, courseDetails);
            return ResponseEntity.ok(updatedCourse);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 5. API xóa khóa học (DELETE)
    // URL: DELETE http://localhost:8080/api/v1/courses/1
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        try {
            courseService.deleteCourse(id);
            return ResponseEntity.noContent().build(); // Trả về 204 No Content
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}