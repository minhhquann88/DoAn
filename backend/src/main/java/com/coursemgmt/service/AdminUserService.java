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

    // Lấy danh sách users với phân trang và tìm kiếm
    public Page<AdminUserDTO> getUsers(Pageable pageable, String search) {
        // Tạo Specification để tìm kiếm động → Query: SELECT * FROM users WHERE email LIKE ? OR fullName LIKE ?
        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (search != null && !search.trim().isEmpty()) {
                String searchPattern = "%" + search.trim() + "%"; // Pattern: %keyword% (tìm kiếm không phân biệt hoa thường)
                Predicate emailPredicate = cb.like(cb.lower(root.get("email")), searchPattern.toLowerCase()); // WHERE LOWER(email) LIKE '%keyword%'
                Predicate namePredicate = cb.like(cb.lower(root.get("fullName")), searchPattern.toLowerCase()); // OR LOWER(fullName) LIKE '%keyword%'
                predicates.add(cb.or(emailPredicate, namePredicate)); // Tìm trong email HOẶC fullName
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        
        // Query database với Specification và phân trang → SELECT * FROM users WHERE ... LIMIT ? OFFSET ?
        Page<User> userPage = userRepository.findAll(spec, pageable);
        // Convert User entity → AdminUserDTO (tránh expose thông tin nhạy cảm như password)
        List<AdminUserDTO> dtoList = userPage.getContent().stream()
                .map(AdminUserDTO::fromEntity)
                .collect(Collectors.toList());
        
        return new PageImpl<>(dtoList, pageable, userPage.getTotalElements());
    }

    // Cập nhật trạng thái user (Active/Locked)
    public AdminUserDTO updateUserStatus(Long userId, Boolean isEnabled, String lockReason) {
        // Bước 1: Tìm user theo ID
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        user.setIsEnabled(isEnabled); // Set trạng thái: true = Active, false = Locked
        if (isEnabled != null && !isEnabled) {
            // Nếu khóa tài khoản → Lưu lý do khóa
            user.setLockReason(lockReason != null && !lockReason.trim().isEmpty() 
                ? lockReason.trim() 
                : "Tài khoản đã bị khóa bởi quản trị viên");
        } else if (isEnabled != null && isEnabled) {
            // Nếu mở khóa → Xóa lý do khóa
            user.setLockReason(null);
        }
        
        // Bước 2: Lưu thay đổi vào database → UPDATE users SET isEnabled = ?, lockReason = ? WHERE id = ?
        User savedUser = userRepository.save(user);
        return AdminUserDTO.fromEntity(savedUser); // Convert → DTO
    }
}

