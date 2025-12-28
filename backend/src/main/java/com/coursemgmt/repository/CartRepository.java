package com.coursemgmt.repository;

import com.coursemgmt.model.Cart;
import com.coursemgmt.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    
    // Tìm Cart theo User
    Optional<Cart> findByUser(User user);
    
    // Tìm Cart theo User ID
    Optional<Cart> findByUserId(Long userId);
    
    // Tìm Cart với items (JOIN FETCH để tránh LazyInitializationException)
    @Query("SELECT DISTINCT c FROM Cart c " +
           "LEFT JOIN FETCH c.items ci " +
           "LEFT JOIN FETCH ci.course co " +
           "LEFT JOIN FETCH co.instructor " +
           "LEFT JOIN FETCH co.category " +
           "WHERE c.user.id = :userId")
    Optional<Cart> findByUserIdWithItems(@Param("userId") Long userId);
    
    // Tìm Cart theo ID với items (JOIN FETCH)
    @Query("SELECT DISTINCT c FROM Cart c " +
           "LEFT JOIN FETCH c.items ci " +
           "LEFT JOIN FETCH ci.course co " +
           "LEFT JOIN FETCH co.instructor " +
           "LEFT JOIN FETCH co.category " +
           "WHERE c.id = :cartId")
    Optional<Cart> findByIdWithItems(@Param("cartId") Long cartId);
}

