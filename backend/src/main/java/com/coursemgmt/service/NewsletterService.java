package com.coursemgmt.service;

import com.coursemgmt.model.NewsletterSubscription;
import com.coursemgmt.model.User;
import com.coursemgmt.repository.NewsletterSubscriptionRepository;
import com.coursemgmt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class NewsletterService {

    @Autowired
    private NewsletterSubscriptionRepository newsletterRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    /**
     * Đăng ký nhận tin tức (cho guest - chưa đăng nhập)
     */
    @Transactional
    public NewsletterSubscription subscribeGuest(String email) {
        // Kiểm tra email đã tồn tại chưa
        Optional<NewsletterSubscription> existing = newsletterRepository.findByEmail(email);
        
        if (existing.isPresent()) {
            NewsletterSubscription subscription = existing.get();
            if (subscription.getIsActive()) {
                throw new RuntimeException("Email này đã được đăng ký nhận tin tức");
            } else {
                // Kích hoạt lại subscription cũ
                subscription.setIsActive(true);
                return newsletterRepository.save(subscription);
            }
        }

        // Tạo subscription mới
        NewsletterSubscription subscription = new NewsletterSubscription();
        subscription.setEmail(email);
        subscription.setIsActive(true);
        subscription.setUserId(null); // Guest user

        NewsletterSubscription saved = newsletterRepository.save(subscription);
        
        // Gửi email chào mừng
        emailService.sendWelcomeNewsletterEmail(email);
        
        return saved;
    }

    /**
     * Đăng ký/hủy đăng ký nhận tin tức (cho user đã đăng nhập)
     */
    @Transactional
    public void toggleUserSubscription(Long userId, boolean enabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Cập nhật setting trong User
        user.setEmailNotificationEnabled(enabled);
        userRepository.save(user);

        // Đồng bộ với NewsletterSubscription
        Optional<NewsletterSubscription> existing = newsletterRepository.findByEmail(user.getEmail());
        
        if (enabled) {
            // Bật: Tạo hoặc kích hoạt subscription
            if (existing.isPresent()) {
                NewsletterSubscription subscription = existing.get();
                subscription.setIsActive(true);
                subscription.setUserId(userId);
                newsletterRepository.save(subscription);
            } else {
                NewsletterSubscription subscription = new NewsletterSubscription();
                subscription.setEmail(user.getEmail());
                subscription.setIsActive(true);
                subscription.setUserId(userId);
                newsletterRepository.save(subscription);
            }
        } else {
            // Tắt: Vô hiệu hóa subscription
            if (existing.isPresent()) {
                NewsletterSubscription subscription = existing.get();
                subscription.setIsActive(false);
                newsletterRepository.save(subscription);
            }
        }
    }

    /**
     * Lấy danh sách email đăng ký nhận tin tức (active)
     */
    @Transactional(readOnly = true)
    public List<String> getActiveSubscriberEmails() {
        return newsletterRepository.findByIsActiveTrue()
                .stream()
                .map(NewsletterSubscription::getEmail)
                .toList();
    }

    /**
     * Gửi email thông báo đến tất cả người đăng ký
     */
    @Transactional
    public void sendNewsletterToAll(String subject, String content) {
        List<String> emails = getActiveSubscriberEmails();
        for (String email : emails) {
            emailService.sendEmail(email, subject, content);
        }
    }

    /**
     * Gửi email thông báo khóa học mới đến tất cả người đăng ký
     */
    @Transactional
    public void sendNewCourseNotification(String courseTitle, String courseUrl) {
        List<String> emails = getActiveSubscriberEmails();
        System.out.println(">>> Sending new course notification to " + emails.size() + " subscribers");
        
        for (String email : emails) {
            try {
                emailService.sendNewCourseNotification(email, courseTitle, courseUrl);
                System.out.println(">>> Email sent to: " + email);
            } catch (Exception e) {
                System.err.println(">>> ERROR: Failed to send email to " + email + ": " + e.getMessage());
                // Tiếp tục gửi cho các email khác
            }
        }
        
        System.out.println(">>> Finished sending new course notifications");
    }

    /**
     * Lấy trạng thái đăng ký của user
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getUserSubscriptionStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        
        Map<String, Object> response = new HashMap<>();
        response.put("enabled", user.getEmailNotificationEnabled() != null && user.getEmailNotificationEnabled());
        response.put("email", user.getEmail());
        
        return response;
    }
}

