package com.coursemgmt.service;

import com.coursemgmt.dto.AdminUserDTO;
import com.coursemgmt.model.User;
import com.coursemgmt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AdminUserService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Lấy danh sách users với phân trang và tìm kiếm
     */
    public Page<AdminUserDTO> getUsers(Pageable pageable, String search) {
        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (search != null && !search.trim().isEmpty()) {
                String searchPattern = "%" + search.trim() + "%";
                Predicate emailPredicate = cb.like(cb.lower(root.get("email")), searchPattern.toLowerCase());
                Predicate namePredicate = cb.like(cb.lower(root.get("fullName")), searchPattern.toLowerCase());
                predicates.add(cb.or(emailPredicate, namePredicate));
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        
        Page<User> userPage = userRepository.findAll(spec, pageable);
        
        // Convert to DTO
        List<AdminUserDTO> dtoList = userPage.getContent().stream()
                .map(AdminUserDTO::fromEntity)
                .collect(Collectors.toList());
        
        return new PageImpl<>(dtoList, pageable, userPage.getTotalElements());
    }

    /**
     * Lấy user theo ID
     */
    public Optional<AdminUserDTO> getUserById(Long id) {
        return userRepository.findById(id)
                .map(AdminUserDTO::fromEntity);
    }

    /**
     * Cập nhật trạng thái user (Active/Locked)
     */
    public AdminUserDTO updateUserStatus(Long userId, Boolean isEnabled, String lockReason) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        user.setIsEnabled(isEnabled);
        if (isEnabled != null && !isEnabled) {
            // Khi khóa tài khoản, lưu lý do
            user.setLockReason(lockReason != null && !lockReason.trim().isEmpty() 
                ? lockReason.trim() 
                : "Tài khoản đã bị khóa bởi quản trị viên");
        } else if (isEnabled != null && isEnabled) {
            // Khi mở khóa, xóa lý do
            user.setLockReason(null);
        }
        
        User savedUser = userRepository.save(user);
        return AdminUserDTO.fromEntity(savedUser);
    }
}

