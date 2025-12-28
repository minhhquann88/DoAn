package com.coursemgmt.service;

import com.coursemgmt.model.*;
import com.coursemgmt.repository.NotificationRepository;
import com.coursemgmt.repository.UserRepository;
import com.coursemgmt.repository.CourseRepository;
import com.coursemgmt.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private TransactionRepository transactionRepository;
    
    /**
     * Tạo thông báo khi có học viên mua khóa học
     */
    @Transactional
    public void notifyCoursePurchased(Long studentId, Long courseId, Long transactionId) {
        try {
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));
            
            // Lấy instructor của khóa học
            User instructor = course.getInstructor();
            if (instructor == null) {
                System.err.println(">>> WARNING: Course " + courseId + " has no instructor, skipping notification");
                return;
            }
            
            User student = userRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));
            
            Transaction transaction = null;
            if (transactionId != null) {
                transaction = transactionRepository.findById(transactionId).orElse(null);
            }
            
            // Tạo thông báo cho instructor
            Notification notification = new Notification();
            notification.setUser(instructor);
            notification.setCourse(course);
            notification.setTransaction(transaction);
            notification.setMessage(String.format(
                "Học viên %s đã mua khóa học '%s' của bạn",
                student.getFullName() != null ? student.getFullName() : student.getUsername(),
                course.getTitle()
            ));
            notification.setType("COURSE_PURCHASED");
            notification.setIsRead(false);
            notification.setCreatedAt(LocalDateTime.now());
            
            notificationRepository.save(notification);
            System.out.println(">>> Notification created for instructor " + instructor.getId() + 
                             " about course purchase by student " + studentId);
        } catch (Exception e) {
            // Log error nhưng không throw để không ảnh hưởng đến quá trình thanh toán
            System.err.println(">>> ERROR: Failed to create notification: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Lấy danh sách thông báo của user
     */
    @Transactional(readOnly = true)
    public Page<Notification> getUserNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }
    
    /**
     * Đếm số thông báo chưa đọc
     */
    @Transactional(readOnly = true)
    public Long getUnreadCount(Long userId) {
        Long count = notificationRepository.countByUserIdAndIsReadFalse(userId);
        return count != null ? count : 0L;
    }
    
    /**
     * Đánh dấu thông báo là đã đọc
     */
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        // Kiểm tra quyền: chỉ user sở hữu mới có thể đánh dấu đã đọc
        if (!notification.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to mark this notification as read");
        }
        
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }
    
    /**
     * Đánh dấu tất cả thông báo là đã đọc
     */
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = notificationRepository
                .findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        
        for (Notification notification : unreadNotifications) {
            notification.setIsRead(true);
        }
        
        if (!unreadNotifications.isEmpty()) {
            notificationRepository.saveAll(unreadNotifications);
        }
    }
}

