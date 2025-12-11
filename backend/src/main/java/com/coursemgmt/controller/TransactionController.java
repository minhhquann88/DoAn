package com.coursemgmt.controller;

import com.coursemgmt.dto.*;
import com.coursemgmt.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    /**
     * 1. Tạo giao dịch mới (Khởi tạo thanh toán)
     * POST /api/v1/transactions
     */
    @PostMapping
    public ResponseEntity<PaymentResponse> createTransaction(
        @Valid @RequestBody TransactionCreateRequest request
    ) {
        PaymentResponse response = transactionService.createTransaction(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * 2. Xử lý callback từ cổng thanh toán
     * GET /api/v1/transactions/payment/callback
     * 
     * VNPay sẽ redirect user về URL này sau khi thanh toán
     */
    @GetMapping("/payment/callback")
    public ResponseEntity<TransactionDTO> handlePaymentCallback(
        @RequestParam Map<String, String> params
    ) {
        TransactionDTO transaction = transactionService.processPaymentCallback(params);
        return ResponseEntity.ok(transaction);
    }

    /**
     * 3. Lấy tất cả giao dịch (có phân trang)
     * GET /api/v1/transactions
     */
    @GetMapping
    public ResponseEntity<Page<TransactionDTO>> getAllTransactions(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(defaultValue = "createdAt") String sortBy,
        @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        Sort.Direction direction = sortDir.equalsIgnoreCase("ASC") 
            ? Sort.Direction.ASC 
            : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        Page<TransactionDTO> transactions = transactionService.getAllTransactions(pageable);
        return ResponseEntity.ok(transactions);
    }

    /**
     * 4. Lấy giao dịch theo ID
     * GET /api/v1/transactions/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<TransactionDTO> getTransactionById(@PathVariable Long id) {
        TransactionDTO transaction = transactionService.getTransactionById(id);
        return ResponseEntity.ok(transaction);
    }

    /**
     * 5. Lấy giao dịch của user
     * GET /api/v1/transactions/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<TransactionDTO>> getUserTransactions(
        @PathVariable Long userId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<TransactionDTO> transactions = transactionService.getUserTransactions(userId, pageable);
        return ResponseEntity.ok(transactions);
    }

    /**
     * 6. Lấy giao dịch của course
     * GET /api/v1/transactions/course/{courseId}
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<Page<TransactionDTO>> getCourseTransactions(
        @PathVariable Long courseId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<TransactionDTO> transactions = transactionService.getCourseTransactions(courseId, pageable);
        return ResponseEntity.ok(transactions);
    }

    /**
     * 7. Thống kê doanh thu theo khoảng thời gian
     * GET /api/v1/transactions/revenue
     */
    @GetMapping("/revenue")
    public ResponseEntity<Map<String, Object>> getRevenue(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        Double revenue = transactionService.calculateRevenue(startDate, endDate);
        return ResponseEntity.ok(Map.of(
            "startDate", startDate,
            "endDate", endDate,
            "totalRevenue", revenue
        ));
    }
}

