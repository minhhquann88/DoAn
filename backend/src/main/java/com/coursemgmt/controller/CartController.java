package com.coursemgmt.controller;

import com.coursemgmt.dto.AddToCartRequest;
import com.coursemgmt.dto.CartResponse;
import com.coursemgmt.security.services.UserDetailsImpl;
import com.coursemgmt.service.CartService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    /**
     * Lấy giỏ hàng của user hiện tại
     * GET /api/v1/cart
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CartResponse> getCart(
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        if (userDetails == null || userDetails.getId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(null);
        }
        CartResponse cart = cartService.getCart(userDetails.getId());
        return ResponseEntity.ok(cart);
    }

    /**
     * Thêm khóa học vào giỏ hàng
     * POST /api/v1/cart/add
     */
    @PostMapping("/add")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CartResponse> addToCart(
            @Valid @RequestBody AddToCartRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        try {
            CartResponse cart = cartService.addToCart(userDetails.getId(), request.getCourseId());
            return ResponseEntity.ok(cart);
        } catch (RuntimeException e) {
            if (e.getMessage() != null && 
                (e.getMessage().contains("đã sở hữu") || e.getMessage().contains("đã có trong giỏ hàng"))) {
                return ResponseEntity.badRequest()
                        .body(null); // Frontend will handle error message
            }
            throw e;
        }
    }

    /**
     * Xóa item khỏi giỏ hàng
     * DELETE /api/v1/cart/items/{itemId}
     */
    @DeleteMapping("/items/{itemId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CartResponse> removeFromCart(
            @PathVariable Long itemId,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        try {
            CartResponse cart = cartService.removeFromCart(userDetails.getId(), itemId);
            return ResponseEntity.ok(cart);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    /**
     * Xóa tất cả items khỏi giỏ hàng
     * DELETE /api/v1/cart/clear
     */
    @DeleteMapping("/clear")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> clearCart(
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        cartService.clearCart(userDetails.getId());
        return ResponseEntity.ok().build();
    }

    /**
     * Checkout từ giỏ hàng - Tạo payment URL
     * POST /api/v1/cart/checkout
     */
    @PostMapping("/checkout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> checkout(
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        try {
            Map<String, String> response = cartService.checkout(userDetails.getId());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to checkout: " + e.getMessage()));
        }
    }
}

