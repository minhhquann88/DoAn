package com.coursemgmt.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Yêu cầu đặt lại mật khẩu cho hệ thống Elearning");
        message.setText("Chào bạn,\n\n"
                + "Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng nhấn vào link bên dưới để tiếp tục:\n"
                + resetLink + "\n\n"
                + "Nếu bạn không yêu cầu, vui lòng bỏ qua email này.\n");

        // Bạn cần cấu hình email trong application.properties để hàm này chạy được
        mailSender.send(message);
    }
}