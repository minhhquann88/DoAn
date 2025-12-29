package com.coursemgmt.service;

import com.coursemgmt.dto.*;
import com.coursemgmt.model.*;
import com.coursemgmt.repository.*;
import com.coursemgmt.model.ERole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class InstructorService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private EnrollmentRepository enrollmentRepository;
    
    @Autowired
    private TransactionRepository transactionRepository;

    /**
     * Lấy danh sách tất cả giảng viên
     */
    public Page<InstructorDTO> getAllInstructors(Pageable pageable) {
        // In production, would filter by role = INSTRUCTOR
        Page<User> instructors = userRepository.findAll(pageable);
        return instructors.map(this::convertToDTO);
    }

    /**
     * Lấy thông tin giảng viên theo ID
     */
    public InstructorDTO getInstructorById(Long instructorId) {
        User instructor = userRepository.findById(instructorId)
            .orElseThrow(() -> new RuntimeException("Instructor not found with id: " + instructorId));
        return convertToDTO(instructor);
    }

    /**
     * Tạo giảng viên mới
     */
    @Transactional
    public InstructorDTO createInstructor(InstructorCreateRequest request) {
        // Check if email already exists
        // In production, would check userRepository.findByEmail()
        
        User instructor = new User();
        instructor.setFullName(request.getFullName());
        instructor.setEmail(request.getEmail());
        // Password should be hashed - in production use BCrypt
        // instructor.setPassword(passwordEncoder.encode(request.getPassword()));
        // Note: phone field not in User entity
        instructor.setCreatedAt(LocalDateTime.now());
        // Would set INSTRUCTOR role here
        
        User saved = userRepository.save(instructor);
        return convertToDTO(saved);
    }

    /**
     * Cập nhật thông tin giảng viên
     */
    @Transactional
    public InstructorDTO updateInstructor(Long instructorId, InstructorUpdateRequest request) {
        User instructor = userRepository.findById(instructorId)
            .orElseThrow(() -> new RuntimeException("Instructor not found with id: " + instructorId));
        
        if (request.getFullName() != null) {
            instructor.setFullName(request.getFullName());
        }
        
        // Note: phone field not in User entity
        if (request.getBio() != null) {
            instructor.setBio(request.getBio());
        }
        
        // Update other fields as needed
        
        User updated = userRepository.save(instructor);
        return convertToDTO(updated);
    }

    /**
     * Xóa giảng viên
     */
    @Transactional
    public void deleteInstructor(Long instructorId) {
        User instructor = userRepository.findById(instructorId)
            .orElseThrow(() -> new RuntimeException("Instructor not found with id: " + instructorId));
        
        // Check if instructor has courses
        List<Course> courses = courseRepository.findByInstructorId(instructorId);
        
        if (!courses.isEmpty()) {
            throw new RuntimeException(
                "Cannot delete instructor with existing courses. " +
                "Please reassign or delete courses first."
            );
        }
        
        userRepository.delete(instructor);
    }

    /**
     * Suspend/Activate giảng viên
     */
    @Transactional
    public InstructorDTO updateInstructorStatus(Long instructorId, String status) {
        User instructor = userRepository.findById(instructorId)
            .orElseThrow(() -> new RuntimeException("Instructor not found with id: " + instructorId));
        
        // In production, would update status field
        // instructor.setStatus(status);
        
        User updated = userRepository.save(instructor);
        return convertToDTO(updated);
    }

    /**
     * Khóa tài khoản giảng viên (Admin only)
     */
    @Transactional
    public InstructorDTO lockInstructor(Long instructorId) {
        User instructor = userRepository.findById(instructorId)
            .orElseThrow(() -> new RuntimeException("Instructor not found with id: " + instructorId));
        
        // Kiểm tra xem có phải Admin không (không cho phép khóa Admin)
        boolean isAdmin = instructor.getRoles().stream()
            .anyMatch(role -> role.getName() == ERole.ROLE_ADMIN);
        
        if (isAdmin) {
            throw new RuntimeException("Cannot lock admin account!");
        }
        
        instructor.setIsEnabled(false);
        User updated = userRepository.save(instructor);
        return convertToDTO(updated);
    }

    /**
     * Mở khóa tài khoản giảng viên (Admin only)
     */
    @Transactional
    public InstructorDTO unlockInstructor(Long instructorId) {
        User instructor = userRepository.findById(instructorId)
            .orElseThrow(() -> new RuntimeException("Instructor not found with id: " + instructorId));
        
        instructor.setIsEnabled(true);
        User updated = userRepository.save(instructor);
        return convertToDTO(updated);
    }

    /**
     * Lấy danh sách khóa học của giảng viên
     */
    public List<Course> getInstructorCourses(Long instructorId) {
        return courseRepository.findByInstructorId(instructorId);
    }

    /**
     * Lấy thống kê của giảng viên
     */
    public InstructorDTO getInstructorWithStats(Long instructorId) {
        User instructor = userRepository.findById(instructorId)
            .orElseThrow(() -> new RuntimeException("Instructor not found with id: " + instructorId));
        
        InstructorDTO dto = convertToDTO(instructor);
        
        // Get courses
        List<Course> courses = courseRepository.findByInstructorId(instructorId);
        dto.setTotalCourses(courses.size());
        
        long published = courses.stream()
            .filter(c -> "PUBLISHED".equals(c.getStatus()))
            .count();
        dto.setPublishedCourses((int) published);
        
        // Get total students (unique)
        Set<Long> uniqueStudents = new HashSet<>();
        for (Course course : courses) {
            List<Enrollment> enrollments = enrollmentRepository
                .findByCourseId(course.getId(), Pageable.unpaged())
                .getContent();
            enrollments.forEach(e -> uniqueStudents.add(e.getUser().getId()));
        }
        dto.setTotalStudents(uniqueStudents.size());
        
        // Calculate total revenue
        double totalRevenue = 0.0;
        for (Course course : courses) {
            List<Transaction> transactions = transactionRepository
                .findByCourseId(course.getId(), Pageable.unpaged())
                .getContent();
            
            totalRevenue += transactions.stream()
                .filter(t -> "SUCCESS".equals(t.getStatus()))
                .mapToDouble(Transaction::getAmount)
                .sum();
        }
        dto.setTotalRevenue((long) totalRevenue);
        
        return dto;
    }

    /**
     * Convert User entity to InstructorDTO
     */
    private InstructorDTO convertToDTO(User user) {
        InstructorDTO dto = new InstructorDTO();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        // Note: phone field not in User entity
        dto.setPhone(null);
        dto.setJoinedAt(user.getCreatedAt());
        
        // Get basic stats
        List<Course> courses = courseRepository.findByInstructorId(user.getId());
        dto.setTotalCourses(courses.size());
        
        long published = courses.stream()
            .filter(c -> "PUBLISHED".equals(c.getStatus()))
            .count();
        dto.setPublishedCourses((int) published);
        
        return dto;
    }
}

