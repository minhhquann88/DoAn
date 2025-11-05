package com.coursemgmt.security.services;

import com.coursemgmt.model.Course;
import com.coursemgmt.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service("courseSecurityService") // Đặt tên Bean để gọi trong @PreAuthorize
public class CourseSecurityService {

    @Autowired
    private CourseRepository courseRepository;

    /**
     * Kiểm tra xem user đang đăng nhập có phải là GIẢNG VIÊN (instructor)
     * của khóa học không.
     */
    public boolean isInstructor(Authentication authentication, Long courseId) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long currentUserId = userDetails.getId();

        Course course = courseRepository.findById(courseId).orElse(null);

        if (course == null || course.getInstructor() == null) {
            return false;
        }

        return course.getInstructor().getId().equals(currentUserId);
    }
}