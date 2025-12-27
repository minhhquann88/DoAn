package com.coursemgmt.service;

import com.coursemgmt.exception.ResourceNotFoundException;
import com.coursemgmt.model.*;
import com.coursemgmt.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@Service
public class PaymentService {

    @Autowired
    private TransactionRepository transactionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    /**
     * Tạo payment URL cho việc mua khóa học
     * UC-PAY-01: Payment Module - Create Payment
     */
    @Transactional
    public Map<String, String> createPaymentUrl(Long courseId) {
        // Lấy user hiện tại từ authentication
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetails)) {
            throw new RuntimeException("User not authenticated");
        }
        
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String username = userDetails.getUsername();
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        // Validate course
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Course not found with id: " + courseId
                ));
        
        // Check if user already enrolled
        Long userId = user.getId();
        if (userId != null && courseId != null) {
            Optional<Enrollment> existingEnrollment = enrollmentRepository
                    .findByUserIdAndCourseId(userId, courseId);
            
            if (existingEnrollment.isPresent()) {
                throw new RuntimeException("Bạn đã đăng ký khóa học này rồi");
            }
        }
        
        // Create new Transaction with status PENDING
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setCourse(course);
        transaction.setAmount(course.getPrice());
        transaction.setStatus(ETransactionStatus.PENDING);
        transaction.setPaymentGateway(EPaymentGateway.VNPAY); // Default to VNPAY for mock
        transaction.setCreatedAt(LocalDateTime.now());
        
        // Generate unique transaction code
        String transactionCode = generateTransactionCode();
        transaction.setTransactionCode(transactionCode);
        
        Transaction saved = transactionRepository.save(transaction);
        
        // MOCK LOGIC: Return mock payment URL instead of calling real VNPay
        String paymentUrl = "http://localhost:3000/payment/mock-gateway?txnCode=" + 
                          transactionCode + "&amount=" + saved.getAmount();
        
        return Map.of(
            "paymentUrl", paymentUrl,
            "transactionCode", transactionCode,
            "amount", saved.getAmount().toString()
        );
    }

    /**
     * Xử lý callback từ payment gateway (Mock IPN)
     * UC-PAY-01: Payment Module - Process Callback
     * @param txnCode Transaction code
     * @param status Payment status (SUCCESS/FAILED)
     * @param cartId Optional cart ID if payment is from cart checkout
     */
    @Transactional
    public Map<String, String> processCallback(String txnCode, String status, String cartId) {
        System.out.println("========================================");
        System.out.println("Processing Payment Callback");
        System.out.println("Transaction Code: " + txnCode);
        System.out.println("Status Received: " + status);
        System.out.println("========================================");
        
        // 1. Find Transaction by transactionCode
        Transaction transaction = transactionRepository.findByTransactionCode(txnCode)
                .orElseThrow(() -> {
                    System.err.println("ERROR: Transaction not found with code: " + txnCode);
                    return new ResourceNotFoundException(
                        "Transaction not found with code: " + txnCode
                    );
                });
        
        System.out.println("Transaction found: ID=" + transaction.getId() + 
                          ", User=" + transaction.getUser().getId() + 
                          ", Course=" + transaction.getCourse().getId() + 
                          ", Amount=" + transaction.getAmount());
        
        // 2. Normalize Status (Case Insensitive)
        ETransactionStatus newStatus;
        try {
            newStatus = ETransactionStatus.valueOf(status.toUpperCase());
            System.out.println("Status normalized to: " + newStatus);
        } catch (IllegalArgumentException e) {
            System.err.println("ERROR: Invalid status received: " + status);
            throw new IllegalArgumentException("Invalid status: " + status + ". Must be SUCCESS or FAILED");
        }
        
        // 3. Update transaction status
        transaction.setStatus(newStatus);
        Transaction savedTransaction = transactionRepository.save(transaction);
        System.out.println("Transaction status updated to: " + savedTransaction.getStatus());
        
        // 4. Create Enrollment IF Success
        if (newStatus == ETransactionStatus.SUCCESS) {
            System.out.println("Status is SUCCESS - Creating Enrollment...");
            createEnrollmentAfterPayment(transaction, cartId);
        } else {
            System.out.println("Status is " + newStatus + " - Skipping Enrollment creation");
        }
        
        System.out.println("========================================");
        System.out.println("Callback processing completed");
        System.out.println("========================================");
        
        return Map.of(
            "message", "Payment callback processed successfully",
            "transactionCode", txnCode,
            "status", savedTransaction.getStatus().toString()
        );
    }

    /**
     * Tự động tạo enrollment sau khi thanh toán thành công
     * @param transaction Transaction đã thanh toán thành công
     * @param cartId Cart ID nếu thanh toán từ giỏ hàng (null nếu thanh toán đơn lẻ)
     */
    private void createEnrollmentAfterPayment(Transaction transaction, String cartId) {
        Long userId = transaction.getUser().getId();
        
        if (cartId != null && !cartId.isEmpty()) {
            // Cart checkout: Create enrollments for all courses in cart
            System.out.println(">>> Processing CART CHECKOUT - Cart ID: " + cartId);
            
            try {
                Long cartIdLong = Long.parseLong(cartId);
                Optional<Cart> cartOpt = cartRepository.findById(cartIdLong);
                
                if (cartOpt.isPresent()) {
                    Cart cart = cartOpt.get();
                    if (cart.getItems() != null && !cart.getItems().isEmpty()) {
                        System.out.println(">>> Found " + cart.getItems().size() + " courses in cart");
                        
                        // Create enrollments for all courses in cart
                        for (CartItem item : cart.getItems()) {
                            Course course = item.getCourse();
                            createSingleEnrollment(userId, course);
                        }
                        
                        // Clear cart after successful payment
                        cartItemRepository.deleteByCart(cart);
                        System.out.println(">>> Cart cleared after successful payment");
                    }
                } else {
                    System.err.println(">>> WARNING: Cart not found with ID: " + cartId);
                    // Fallback: Create enrollment for the transaction's course
                    createSingleEnrollment(userId, transaction.getCourse());
                }
            } catch (NumberFormatException e) {
                System.err.println(">>> ERROR: Invalid cartId format: " + cartId);
                // Fallback: Create enrollment for the transaction's course
                createSingleEnrollment(userId, transaction.getCourse());
            }
        } else {
            // Single course payment: Create enrollment for the transaction's course
            System.out.println(">>> Processing SINGLE COURSE PAYMENT");
            createSingleEnrollment(userId, transaction.getCourse());
        }
    }
    
    /**
     * Tạo enrollment cho một course
     */
    private void createSingleEnrollment(Long userId, Course course) {
        Long courseId = course.getId();
        
        System.out.println(">>> Creating Enrollment for User ID: " + userId + ", Course ID: " + courseId);
        
        // Check if enrollment already exists (prevent duplicates)
        boolean alreadyEnrolled = enrollmentRepository.existsByUserIdAndCourseId(userId, courseId);
        
        if (alreadyEnrolled) {
            System.out.println(">>> WARNING: User " + userId + " is already enrolled in Course " + courseId + ". Skipping enrollment creation.");
            return;
        }
        
        System.out.println(">>> No existing enrollment found. Creating new enrollment...");
        
        // Create new enrollment
        Enrollment enrollment = new Enrollment();
        enrollment.setUser(userRepository.findById(userId).orElseThrow());
        enrollment.setCourse(course);
        enrollment.setEnrolledAt(LocalDateTime.now());
        enrollment.setProgress(0.0);
        enrollment.setStatus(EEnrollmentStatus.IN_PROGRESS);
        
        System.out.println(">>> Enrollment object created:");
        System.out.println("    - User: " + enrollment.getUser().getId() + " (" + enrollment.getUser().getUsername() + ")");
        System.out.println("    - Course: " + enrollment.getCourse().getId() + " (" + enrollment.getCourse().getTitle() + ")");
        System.out.println("    - EnrolledAt: " + enrollment.getEnrolledAt());
        System.out.println("    - Status: " + enrollment.getStatus());
        
        // Save enrollment
        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);
        
        System.out.println(">>> SUCCESS: Enrollment created with ID: " + savedEnrollment.getId());
        System.out.println(">>> Enrollment saved for User " + userId + " in Course " + courseId);
        
        // Verify the save
        Optional<Enrollment> verifyEnrollment = enrollmentRepository.findById(savedEnrollment.getId());
        if (verifyEnrollment.isPresent()) {
            System.out.println(">>> VERIFIED: Enrollment exists in database with ID: " + verifyEnrollment.get().getId());
        } else {
            System.err.println(">>> ERROR: Enrollment was not saved properly! ID: " + savedEnrollment.getId());
        }
    }

    /**
     * Generate unique transaction code
     */
    private String generateTransactionCode() {
        return "TXN_" + System.currentTimeMillis() + 
               String.format("%04d", new Random().nextInt(10000));
    }
}

