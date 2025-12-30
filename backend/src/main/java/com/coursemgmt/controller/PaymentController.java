package com.coursemgmt.controller;

import com.coursemgmt.dto.PaymentCallbackRequest;
import com.coursemgmt.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    /**
     * UC-PAY-01: Tạo payment URL để mua khóa học
     * POST /api/v1/payment/create
     * Input: { courseId }
     * Output: { paymentUrl, transactionCode, amount }
     */
    @PostMapping("/create")
    public ResponseEntity<?> createPayment(@RequestBody Map<String, Object> payload) {
        System.out.println("========================================");
        System.out.println("Payment Request Received");
        System.out.println("Payload: " + payload);
        System.out.println("========================================");
        
        // Validate payload contains courseId
        if (!payload.containsKey("courseId")) {
            System.err.println("ERROR: Missing 'courseId' in payload");
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Missing 'courseId' in payload"));
        }
        
        try {
            // Safely parse courseId from the map
            Object courseIdObj = payload.get("courseId");
            System.out.println("CourseId from payload (raw): " + courseIdObj + " (type: " + 
                             (courseIdObj != null ? courseIdObj.getClass().getName() : "null") + ")");
            
            Long courseId;
            if (courseIdObj instanceof Number) {
                courseId = ((Number) courseIdObj).longValue();
            } else if (courseIdObj instanceof String) {
                courseId = Long.parseLong((String) courseIdObj);
            } else {
                throw new IllegalArgumentException("courseId must be a number");
            }
            
            System.out.println("Parsed CourseId: " + courseId);
            
            // Call the service (service will get current user from authentication context)
            Map<String, String> response = paymentService.createPaymentUrl(courseId);
            
            System.out.println("Payment URL created successfully");
            System.out.println("Response: " + response);
            System.out.println("========================================");
            
            return ResponseEntity.ok(response);
        } catch (NumberFormatException e) {
            System.err.println("ERROR: Invalid courseId format: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid courseId format: " + e.getMessage()));
        } catch (IllegalArgumentException e) {
            System.err.println("ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            // Handle "User already enrolled" exception specifically
            if (e.getMessage() != null && e.getMessage().contains("đã đăng ký")) {
                System.err.println("User already enrolled: " + e.getMessage());
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Bạn đã sở hữu khóa học này"));
            }
            System.err.println("ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("ERROR: Unexpected error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create payment: " + e.getMessage()));
        }
    }

    /**
     * UC-PAY-01: Xử lý callback từ payment gateway (Mock IPN)
     * POST /api/v1/payment/ipn-mock
     * Input: { txnCode, status, cartId? }
     * Output: { message, transactionCode, status }
     */
    @PostMapping("/ipn-mock")
    public ResponseEntity<Map<String, String>> processCallback(
            @RequestBody Map<String, Object> payload
    ) {
        System.out.println("========================================");
        System.out.println("IPN Mock Callback Received");
        System.out.println("Full Payload: " + payload);
        System.out.println("========================================");
        
        try {
            String txnCode = (String) payload.get("txnCode");
            String status = (String) payload.get("status");
            String cartId = payload.containsKey("cartId") ? payload.get("cartId").toString() : null;
            
            System.out.println(">>> Parsed values:");
            System.out.println("    txnCode: " + txnCode);
            System.out.println("    status: " + status);
            System.out.println("    cartId: " + cartId);
            
            if (txnCode == null || status == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "txnCode and status are required"));
            }
            
            Map<String, String> response = paymentService.processCallback(
                    txnCode, 
                    status,
                    cartId
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println(">>> ERROR in IPN callback: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process callback: " + e.getMessage()));
        }
    }
}

