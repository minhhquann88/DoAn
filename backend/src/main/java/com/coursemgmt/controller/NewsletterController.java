package com.coursemgmt.controller;

import com.coursemgmt.dto.MessageResponse;
import com.coursemgmt.model.NewsletterSubscription;
import com.coursemgmt.security.services.UserDetailsImpl;
import com.coursemgmt.service.NewsletterService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/newsletter")
@CrossOrigin(origins = "*", maxAge = 3600)
public class NewsletterController {

    @Autowired
    private NewsletterService newsletterService;

    /**
     * Đăng ký nhận tin tức (cho guest - không cần đăng nhập)
     */
    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribe(@Valid @RequestBody SubscribeRequest request) {
        try {
            newsletterService.subscribeGuest(request.getEmail());
            return ResponseEntity.ok(new MessageResponse("Đăng ký nhận tin tức thành công!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new MessageResponse("Có lỗi xảy ra: " + e.getMessage()));
        }
    }

    /**
     * Bật/tắt thông báo email (cho user đã đăng nhập)
     */
    @PostMapping("/toggle")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> toggleSubscription(
            @RequestBody Map<String, Boolean> request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            Boolean enabled = request.get("enabled");
            if (enabled == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("Thiếu tham số 'enabled'"));
            }
            
            newsletterService.toggleUserSubscription(userDetails.getId(), enabled);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", enabled ? "Đã bật thông báo email" : "Đã tắt thông báo email");
            response.put("enabled", enabled);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new MessageResponse("Có lỗi xảy ra: " + e.getMessage()));
        }
    }

    /**
     * Kiểm tra trạng thái đăng ký (cho user đã đăng nhập)
     */
    @GetMapping("/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getSubscriptionStatus(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            // NewsletterService sẽ lấy từ User entity
            Map<String, Object> response = newsletterService.getUserSubscriptionStatus(userDetails.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new MessageResponse("Có lỗi xảy ra: " + e.getMessage()));
        }
    }

    // Inner class for request
    public static class SubscribeRequest {
        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không hợp lệ")
        private String email;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }
}

