package com.coursemgmt.service;

import com.coursemgmt.dto.AddToCartRequest;
import com.coursemgmt.dto.CartItemResponse;
import com.coursemgmt.dto.CartResponse;
import com.coursemgmt.dto.CourseResponse;
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
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    /**
     * Lấy hoặc tạo Cart cho user hiện tại
     */
    @Transactional
    public Cart getOrCreateCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        return cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });
    }

    /**
     * Thêm khóa học vào giỏ hàng
     */
    @Transactional
    public CartResponse addToCart(Long userId, Long courseId) {
        // Validate course
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        // Check if user already enrolled
        if (enrollmentRepository.existsByUserIdAndCourseId(userId, courseId)) {
            throw new RuntimeException("Bạn đã sở hữu khóa học này");
        }

        // Get or create cart
        Cart cart = getOrCreateCart(userId);

        // Check if course already in cart
        Optional<CartItem> existingItem = cartItemRepository.findByCartAndCourse(cart, course);
        if (existingItem.isPresent()) {
            throw new RuntimeException("Khóa học đã có trong giỏ hàng");
        }

        // Create new cart item
        CartItem cartItem = new CartItem();
        cartItem.setCart(cart);
        cartItem.setCourse(course);
        cartItemRepository.save(cartItem);

        // Return updated cart
        return getCart(userId);
    }

    /**
     * Lấy giỏ hàng của user
     */
    @Transactional(readOnly = true)
    public CartResponse getCart(Long userId) {
        Cart cart = cartRepository.findByUserIdWithItems(userId)
                .orElseGet(() -> {
                    // Create empty cart if not exists
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });

        return mapToCartResponse(cart);
    }

    /**
     * Xóa item khỏi giỏ hàng
     */
    @Transactional
    public CartResponse removeFromCart(Long userId, Long itemId) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + itemId));

        // Verify ownership
        if (!item.getCart().getUser().getId().equals(userId)) {
            throw new RuntimeException("You don't have permission to remove this item");
        }

        cartItemRepository.delete(item);

        return getCart(userId);
    }

    /**
     * Xóa tất cả items khỏi giỏ hàng
     */
    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cartItemRepository.deleteByCart(cart);
    }

    /**
     * Checkout từ giỏ hàng - Tạo transactions cho tất cả courses trong cart
     * Trả về payment URL để redirect đến payment gateway
     */
    @Transactional
    public Map<String, String> checkout(Long userId) {
        // Get cart with items
        Cart cart = cartRepository.findByUserIdWithItems(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Giỏ hàng trống");
        }

        User user = cart.getUser();

        // Validate: Check if user already enrolled in any course
        for (CartItem item : cart.getItems()) {
            Course course = item.getCourse();
            if (enrollmentRepository.existsByUserIdAndCourseId(userId, course.getId())) {
                throw new RuntimeException("Bạn đã sở hữu khóa học: " + course.getTitle());
            }
        }

        // Create one transaction for the total amount
        // Use the first course as the main course (for Transaction entity requirement)
        // When payment succeeds, we'll create enrollments for all courses in cart
        Course firstCourse = cart.getItems().get(0).getCourse();
        
        // Calculate total amount
        Double totalAmount = cart.getItems().stream()
                .mapToDouble(item -> item.getCourse().getPrice())
                .sum();

        // Create main transaction with total amount
        Transaction mainTransaction = new Transaction();
        mainTransaction.setUser(user);
        mainTransaction.setCourse(firstCourse); // Use first course (required by entity)
        mainTransaction.setAmount(totalAmount);
        mainTransaction.setStatus(ETransactionStatus.PENDING);
        mainTransaction.setPaymentGateway(EPaymentGateway.VNPAY);
        mainTransaction.setCreatedAt(LocalDateTime.now());
        
        // Generate unique transaction code
        String transactionCode = generateTransactionCode();
        mainTransaction.setTransactionCode(transactionCode);
        
        Transaction savedTransaction = transactionRepository.save(mainTransaction);

        // MOCK LOGIC: Return mock payment URL
        // In real implementation, this would call VNPay/MoMo API with total amount
        String paymentUrl = "http://localhost:3000/payment/mock-gateway?txnCode=" + 
                          transactionCode + 
                          "&amount=" + totalAmount +
                          "&cartId=" + cart.getId(); // Pass cartId to clear cart after payment

        return Map.of(
            "paymentUrl", paymentUrl,
            "transactionCode", transactionCode,
            "amount", totalAmount.toString(),
            "cartId", cart.getId().toString()
        );
    }

    /**
     * Generate unique transaction code
     */
    private String generateTransactionCode() {
        return "TXN_" + System.currentTimeMillis() + 
               String.format("%04d", new Random().nextInt(10000));
    }

    /**
     * Map Cart entity to CartResponse DTO
     */
    private CartResponse mapToCartResponse(Cart cart) {
        CartResponse response = new CartResponse();
        response.setId(cart.getId());
        response.setUserId(cart.getUser().getId());
        response.setCreatedAt(cart.getCreatedAt());
        response.setUpdatedAt(cart.getUpdatedAt());

        if (cart.getItems() != null && !cart.getItems().isEmpty()) {
            List<CartItemResponse> itemResponses = cart.getItems().stream()
                    .map(item -> {
                        CartItemResponse itemResponse = new CartItemResponse();
                        itemResponse.setId(item.getId());
                        itemResponse.setAddedAt(item.getAddedAt());
                        
                        // Map course to CourseResponse
                        Course course = item.getCourse();
                        CourseResponse courseResponse = CourseResponse.fromEntity(course);
                        itemResponse.setCourse(courseResponse);
                        
                        return itemResponse;
                    })
                    .collect(Collectors.toList());

            response.setItems(itemResponses);
            response.setItemCount(itemResponses.size());

            // Calculate total amount
            Double totalAmount = itemResponses.stream()
                    .mapToDouble(item -> item.getCourse().getPrice() != null ? item.getCourse().getPrice() : 0.0)
                    .sum();
            response.setTotalAmount(totalAmount);
        } else {
            response.setItems(List.of());
            response.setItemCount(0);
            response.setTotalAmount(0.0);
        }

        return response;
    }
}

