package com.coursemgmt.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    /**
     * Gửi email thông báo
     */
    public void sendEmail(String to, String subject, String content) {
        try {
        SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(content);
            message.setFrom("noreply@edulearn.com");
            
        mailSender.send(message);
            System.out.println(">>> Email sent successfully to: " + to);
        } catch (Exception e) {
            System.err.println(">>> ERROR: Failed to send email to " + to + ": " + e.getMessage());
            e.printStackTrace();
            // Không throw exception để không ảnh hưởng đến flow chính
        }
    }

    /**
     * Gửi email thông báo khóa học mới
     */
    public void sendNewCourseNotification(String to, String courseTitle, String courseUrl) {
        String subject = "Khóa học mới: " + courseTitle;
        String content = String.format(
            "Xin chào!\n\n" +
            "Chúng tôi xin thông báo có khóa học mới trên EduLearn:\n\n" +
            "📚 %s\n\n" +
            "Hãy truy cập để xem chi tiết: %s\n\n" +
            "Trân trọng,\n" +
            "Đội ngũ EduLearn",
            courseTitle, courseUrl
        );
        sendEmail(to, subject, content);
    }

    /**
     * Gửi email chào mừng đăng ký nhận tin tức
     */
    public void sendWelcomeNewsletterEmail(String to) {
        String subject = "Cảm ơn bạn đã đăng ký nhận tin tức từ EduLearn";
        String content = String.format(
            "Xin chào!\n\n" +
            "Cảm ơn bạn đã đăng ký nhận tin tức từ EduLearn!\n\n" +
            "Bạn sẽ nhận được các thông tin về:\n" +
            "• Khóa học mới\n" +
            "• Ưu đãi đặc biệt\n" +
            "• Cập nhật và tin tức mới nhất\n\n" +
            "Nếu bạn không muốn nhận email này nữa, bạn có thể hủy đăng ký trong phần cài đặt tài khoản.\n\n" +
            "Trân trọng,\n" +
            "Đội ngũ EduLearn"
        );
        sendEmail(to, subject, content);
    }

    /**
     * Gửi email đặt lại mật khẩu
     */
    public void sendPasswordResetEmail(String to, String resetLink) {
        String subject = "Đặt lại mật khẩu EduLearn";
        String content = String.format(
            "Xin chào!\n\n" +
            "Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản EduLearn.\n\n" +
            "Vui lòng click vào link sau để đặt lại mật khẩu:\n" +
            "%s\n\n" +
            "Link này sẽ hết hạn sau 1 giờ.\n\n" +
            "Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.\n\n" +
            "Trân trọng,\n" +
            "Đội ngũ EduLearn",
            resetLink
        );
        sendEmail(to, subject, content);
    }
}
