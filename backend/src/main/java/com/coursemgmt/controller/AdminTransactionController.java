package com.coursemgmt.controller;

import com.coursemgmt.dto.TransactionDTO;
import com.coursemgmt.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/admin/transactions")
@PreAuthorize("hasRole('ADMIN')")
public class AdminTransactionController {

    @Autowired
    private TransactionService transactionService;

    /**
     * GET /api/v1/admin/transactions
     * Lấy tất cả giao dịch với phân trang (Join User & Course)
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
}

