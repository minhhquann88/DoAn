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
            notification.setActionUrl("/instructor/students");
            
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

    /**
     * Tạo thông báo khi có đánh giá mới cho giảng viên
     */
    @Transactional
    public void notifyNewReview(Long studentId, Long courseId, Integer rating) {
        try {
            System.out.println(">>> notifyNewReview called: studentId=" + studentId + ", courseId=" + courseId + ", rating=" + rating);
            
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));
            System.out.println(">>> Course found: " + course.getTitle());
            
            User instructor = course.getInstructor();
            if (instructor == null) {
                System.err.println(">>> WARNING: Course " + courseId + " has no instructor, skipping notification");
                return;
            }
            System.out.println(">>> Instructor found: " + instructor.getFullName() + " (ID: " + instructor.getId() + ")");
            
            User student = userRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));
            System.out.println(">>> Student found: " + student.getFullName() + " (ID: " + studentId + ")");
            
            String stars = "★".repeat(rating) + "☆".repeat(5 - rating);
            
            Notification notification = new Notification();
            notification.setUser(instructor);
            notification.setCourse(course);
            notification.setMessage(String.format(
                "Học viên %s đã đánh giá %s cho khóa học '%s' của bạn",
                student.getFullName() != null ? student.getFullName() : student.getUsername(),
                stars,
                course.getTitle()
            ));
            notification.setType("NEW_REVIEW");
            notification.setIsRead(false);
            notification.setCreatedAt(LocalDateTime.now());
            notification.setActionUrl("/instructor/reviews");
            
            Notification saved = notificationRepository.save(notification);
            System.out.println(">>> Notification created successfully! ID: " + saved.getId() + 
                             " for instructor " + instructor.getId() + 
                             " about new review by student " + studentId);
        } catch (Exception e) {
            System.err.println(">>> ERROR: Failed to create review notification: " + e.getMessage());
            e.printStackTrace();
            // Không throw để không ảnh hưởng đến việc tạo review
        }
    }

    /**
     * Tạo thông báo khi học viên chỉnh sửa đánh giá cho giảng viên
     */
    @Transactional
    public void notifyReviewUpdate(Long studentId, Long courseId, Integer rating) {
        try {
            System.out.println(">>> notifyReviewUpdate called: studentId=" + studentId + ", courseId=" + courseId + ", rating=" + rating);
            
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));
            System.out.println(">>> Course found: " + course.getTitle());
            
            User instructor = course.getInstructor();
            if (instructor == null) {
                System.err.println(">>> WARNING: Course " + courseId + " has no instructor, skipping notification");
                return;
            }
            System.out.println(">>> Instructor found: " + instructor.getFullName() + " (ID: " + instructor.getId() + ")");
            
            User student = userRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));
            System.out.println(">>> Student found: " + student.getFullName() + " (ID: " + studentId + ")");
            
            String stars = "★".repeat(rating) + "☆".repeat(5 - rating);
            
            Notification notification = new Notification();
            notification.setUser(instructor);
            notification.setCourse(course);
            notification.setMessage(String.format(
                "Học viên %s đã chỉnh sửa đánh giá thành %s cho khóa học '%s' của bạn",
                student.getFullName() != null ? student.getFullName() : student.getUsername(),
                stars,
                course.getTitle()
            ));
            notification.setType("REVIEW_UPDATE");
            notification.setIsRead(false);
            notification.setCreatedAt(LocalDateTime.now());
            notification.setActionUrl("/instructor/reviews");
            
            Notification saved = notificationRepository.save(notification);
            System.out.println(">>> Notification created successfully! ID: " + saved.getId() + 
                             " for instructor " + instructor.getId() + 
                             " about updated review by student " + studentId);
        } catch (Exception e) {
            System.err.println(">>> ERROR: Failed to create review update notification: " + e.getMessage());
            e.printStackTrace();
            // Không throw để không ảnh hưởng đến việc cập nhật review
        }
    }

    /**
     * Tạo thông báo khi giảng viên phản hồi đánh giá
     */
    @Transactional
    public void notifyReviewReply(Long studentId, Long courseId, String instructorName) {
        try {
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));
            
            User student = userRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));
            
            Notification notification = new Notification();
            notification.setUser(student);
            notification.setCourse(course);
            notification.setMessage(String.format(
                "Giảng viên %s đã phản hồi đánh giá của bạn về khóa học '%s'",
                instructorName,
                course.getTitle()
            ));
            notification.setType("REVIEW_REPLY");
            notification.setIsRead(false);
            notification.setCreatedAt(LocalDateTime.now());
            notification.setActionUrl("/courses/" + courseId + "?tab=reviews");
            
            notificationRepository.save(notification);
            System.out.println(">>> Notification created for student " + studentId + 
                             " about instructor reply");
        } catch (Exception e) {
            System.err.println(">>> ERROR: Failed to create reply notification: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Tạo thông báo khi có tin nhắn mới trong chat
     */
    @Transactional
    public void notifyNewMessage(Long recipientId, Long senderId, Long conversationId, String senderName, String messageContent) {
        try {
            User recipient = userRepository.findById(recipientId)
                    .orElseThrow(() -> new RuntimeException("Recipient not found: " + recipientId));
            
            User sender = userRepository.findById(senderId)
                    .orElseThrow(() -> new RuntimeException("Sender not found: " + senderId));
            
            // Determine the correct route based on user role
            String actionUrl;
            if (recipient.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_STUDENT"))) {
                actionUrl = "/student/messages?conversation=" + conversationId;
            } else if (recipient.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_LECTURER"))) {
                actionUrl = "/instructor/messages?conversation=" + conversationId;
            } else {
                actionUrl = "/messages?conversation=" + conversationId;
            }
            
            // Truncate message if too long
            String truncatedContent = messageContent.length() > 50 
                ? messageContent.substring(0, 50) + "..." 
                : messageContent;
            
            Notification notification = new Notification();
            notification.setUser(recipient);
            notification.setMessage(String.format(
                "%s: %s",
                senderName != null ? senderName : sender.getUsername(),
                truncatedContent
            ));
            notification.setType("NEW_MESSAGE");
            notification.setIsRead(false);
            notification.setCreatedAt(LocalDateTime.now());
            notification.setActionUrl(actionUrl);
            
            notificationRepository.save(notification);
            System.out.println(">>> Notification created for user " + recipientId + 
                             " about new message from " + senderId);
        } catch (Exception e) {
            System.err.println(">>> ERROR: Failed to create message notification: " + e.getMessage());
            e.printStackTrace();
        }
    }
}

