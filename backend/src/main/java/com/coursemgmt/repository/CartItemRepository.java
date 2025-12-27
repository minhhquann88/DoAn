package com.coursemgmt.repository;

import com.coursemgmt.model.Cart;
import com.coursemgmt.model.CartItem;
import com.coursemgmt.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    
    // Tìm CartItem theo Cart và Course
    Optional<CartItem> findByCartAndCourse(Cart cart, Course course);
    
    // Xóa tất cả items trong Cart
    void deleteByCart(Cart cart);
}

