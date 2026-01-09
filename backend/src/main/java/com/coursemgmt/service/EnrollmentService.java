package com.coursemgmt.service;

import com.coursemgmt.dto.*;
import com.coursemgmt.model.*;
import com.coursemgmt.model.EEnrollmentStatus;
import com.coursemgmt.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EnrollmentService {

    @Autowired
    private EnrollmentRepository enrollmentRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private CertificateRepository certificateRepository;

    // Lấy danh sách enrollment theo course
    public Page<EnrollmentDTO> getEnrollmentsByCourse(Long courseId, Long currentUserId, Pageable pageable) {
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));
        
        User currentUser = userRepository.findById(currentUserId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        boolean isAdmin = currentUser.getRoles().stream()
            .anyMatch(role -> role.getName() == ERole.ROLE_ADMIN);
        
        if (!isAdmin && (course.getInstructor() == null || !course.getInstructor().getId().equals(currentUserId))) {
            throw new AccessDeniedException("You are not authorized to view enrollments for this course");
        }
        
        Page<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId, pageable);
        return enrollments.map(this::convertToDTO);
    }

    // Lấy danh sách enrollment theo student
    public Page<EnrollmentDTO> getEnrollmentsByStudent(Long studentId, Long currentUserId, Pageable pageable) {
        User currentUser = userRepository.findById(currentUserId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        boolean isAdmin = currentUser.getRoles().stream()
            .anyMatch(role -> role.getName() == ERole.ROLE_ADMIN);
        
        if (!isAdmin && !studentId.equals(currentUserId)) {
            throw new AccessDeniedException("You are not authorized to view this student's enrollments");
        }
        
        Page<Enrollment> enrollments = enrollmentRepository.findByUserId(studentId, pageable);
        return enrollments.map(this::convertToDTO);
    }

    // Lấy enrollment theo ID
    public EnrollmentDTO getEnrollmentById(Long enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new RuntimeException("Enrollment not found with id: " + enrollmentId));
        return convertToDTO(enrollment);
    }

    // Tạo enrollment mới
    @Transactional
    public EnrollmentDTO createEnrollment(EnrollmentCreateRequest request) {
        User student = userRepository.findById(request.getStudentId())
            .orElseThrow(() -> new RuntimeException("Student not found with id: " + request.getStudentId()));
        
        Course course = courseRepository.findById(request.getCourseId())
            .orElseThrow(() -> new RuntimeException("Course not found with id: " + request.getCourseId()));
        
        Optional<Enrollment> existing = enrollmentRepository
            .findByUserIdAndCourseId(request.getStudentId(), request.getCourseId());
        
        if (existing.isPresent()) {
            throw new RuntimeException("Student already enrolled in this course");
        }
        
        Enrollment enrollment = new Enrollment();
        enrollment.setUser(student);
        enrollment.setCourse(course);
        enrollment.setProgress(0.0);
        enrollment.setStatus(EEnrollmentStatus.IN_PROGRESS);
        enrollment.setEnrolledAt(LocalDateTime.now());
        
        Enrollment saved = enrollmentRepository.save(enrollment);
        return convertToDTO(saved);
    }

    // Cập nhật trạng thái enrollment
    @Transactional
    public EnrollmentDTO updateEnrollment(Long enrollmentId, EnrollmentUpdateRequest request) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new RuntimeException("Enrollment not found with id: " + enrollmentId));
        
        if (request.getStatus() != null) {
            try {
                EEnrollmentStatus newStatus = EEnrollmentStatus.valueOf(request.getStatus());
                enrollment.setStatus(newStatus);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid status: " + request.getStatus());
            }
        }
        
        if (request.getProgress() != null) {
            enrollment.setProgress(request.getProgress());
            
            if (request.getProgress() >= 100.0 && enrollment.getStatus() != EEnrollmentStatus.COMPLETED) {
                enrollment.setStatus(EEnrollmentStatus.COMPLETED);
            }
        }
        
        Enrollment updated = enrollmentRepository.save(enrollment);
        return convertToDTO(updated);
    }

    // Xóa học viên khỏi khóa học (Admin only)
    @Transactional
    public void removeEnrollment(Long enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new RuntimeException("Enrollment not found with id: " + enrollmentId));
        
        enrollmentRepository.delete(enrollment);
    }

    // Lấy lịch sử học tập của học viên
    public StudentLearningHistoryDTO getStudentLearningHistory(Long studentId, Long currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        boolean isAdmin = currentUser.getRoles().stream()
            .anyMatch(role -> role.getName() == ERole.ROLE_ADMIN);
        
        if (!isAdmin && !studentId.equals(currentUserId)) {
            throw new AccessDeniedException("You are not authorized to view this student's learning history");
        }
        
        User student = userRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));
        
        StudentLearningHistoryDTO history = new StudentLearningHistoryDTO();
        history.setStudentId(studentId);
        history.setStudentName(student.getFullName());
        history.setEmail(student.getEmail());
        
        List<Enrollment> enrollments = enrollmentRepository
            .findByUserId(studentId, Pageable.unpaged())
            .getContent();
        
        history.setTotalCoursesEnrolled(enrollments.size());
        
        long completed = enrollments.stream()
            .filter(e -> EEnrollmentStatus.COMPLETED.equals(e.getStatus()))
            .count();
        long dropped = 0;
        
        history.setCoursesCompleted((int) completed);
        history.setCoursesDropped((int) dropped);
        history.setCoursesInProgress(enrollments.size() - (int) completed - (int) dropped);
        
        if (!enrollments.isEmpty()) {
            double avgProgress = enrollments.stream()
                .mapToDouble(Enrollment::getProgress)
                .average()
                .orElse(0.0);
            history.setOverallProgress(avgProgress);
        }
        
        Long certCount = certificateRepository
            .findByEnrollmentUserId(studentId, Pageable.unpaged())
            .getTotalElements();
        history.setCertificatesEarned(certCount.intValue());
        
        List<EnrollmentDTO> enrollmentDTOs = enrollments.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
        history.setEnrollments(enrollmentDTOs);
        
        Optional<LocalDateTime> lastAccess = enrollments.stream()
            .map(Enrollment::getEnrolledAt)
            .filter(Objects::nonNull)
            .max(LocalDateTime::compareTo);
        lastAccess.ifPresent(history::setLastActivityDate);
        
        return history;
    }


    // Convert Enrollment entity to DTO
    private EnrollmentDTO convertToDTO(Enrollment enrollment) {
        EnrollmentDTO dto = new EnrollmentDTO();
        dto.setId(enrollment.getId());
        
        // Student info
        if (enrollment.getUser() != null) {
            dto.setStudentId(enrollment.getUser().getId());
            dto.setStudentName(enrollment.getUser().getFullName());
            dto.setStudentEmail(enrollment.getUser().getEmail());
        }
        
        // Course info
        if (enrollment.getCourse() != null) {
            dto.setCourseId(enrollment.getCourse().getId());
            dto.setCourseTitle(enrollment.getCourse().getTitle());
            
            if (enrollment.getCourse().getInstructor() != null) {
                dto.setInstructorName(enrollment.getCourse().getInstructor().getFullName());
            }
        }
        
        // Enrollment details
        dto.setStatus(enrollment.getStatus().name());
        dto.setProgress(enrollment.getProgress());
        dto.setEnrolledAt(enrollment.getEnrolledAt());
        // completedAt and lastAccessedAt not in entity - set null
        dto.setCompletedAt(null);
        dto.setLastAccessedAt(null);
        
        return dto;
    }

    // Lấy danh sách học viên của giảng viên hiện tại (My Students)
    public Page<EnrollmentDTO> getMyStudents(Long instructorId, Long courseId, Pageable pageable) {
        List<Course> instructorCourses = courseRepository.findByInstructorId(instructorId);
        
        if (instructorCourses.isEmpty()) {
            return new PageImpl<>(Collections.emptyList(), pageable, 0);
        }
        
        if (courseId != null) {
            boolean courseBelongsToInstructor = instructorCourses.stream()
                .anyMatch(c -> c.getId().equals(courseId));
            
            if (!courseBelongsToInstructor) {
                throw new AccessDeniedException("You are not authorized to view enrollments for this course");
            }
            
            Page<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId, pageable);
            return enrollments.map(this::convertToDTO);
        }
        
        List<Long> courseIds = instructorCourses.stream()
            .map(Course::getId)
            .collect(Collectors.toList());
        
        List<Enrollment> allEnrollments = new ArrayList<>();
        for (Long cId : courseIds) {
            List<Enrollment> enrollments = enrollmentRepository.findByCourseId(cId, Pageable.unpaged())
                .getContent();
            allEnrollments.addAll(enrollments);
        }
        
        Map<Long, Enrollment> uniqueEnrollments = new LinkedHashMap<>();
        for (Enrollment enrollment : allEnrollments) {
            Long studentId = enrollment.getUser().getId();
            if (!uniqueEnrollments.containsKey(studentId) || 
                enrollment.getEnrolledAt().isAfter(uniqueEnrollments.get(studentId).getEnrolledAt())) {
                uniqueEnrollments.put(studentId, enrollment);
            }
        }
        
        List<EnrollmentDTO> enrollmentDTOs = uniqueEnrollments.values().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
        
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), enrollmentDTOs.size());
        List<EnrollmentDTO> pageContent = start < enrollmentDTOs.size() 
            ? enrollmentDTOs.subList(start, end) 
            : Collections.emptyList();
        
        return new PageImpl<>(pageContent, pageable, enrollmentDTOs.size());
    }
}

