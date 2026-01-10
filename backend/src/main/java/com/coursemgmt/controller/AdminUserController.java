package com.coursemgmt.controller;

import com.coursemgmt.dto.AdminUserDTO;
import com.coursemgmt.service.AdminUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/admin/users")
@PreAuthorize("hasRole('ADMIN')") 
public class AdminUserController {

    @Autowired
    private AdminUserService adminUserService;

    // Lấy danh sách users với phân trang và tìm kiếm
    @GetMapping
    public ResponseEntity<Page<AdminUserDTO>> getUsers(
            @RequestParam(defaultValue = "0") int page, 
            @RequestParam(defaultValue = "10") int size, 
            @RequestParam(defaultValue = "createdAt") String sortBy, 
            @RequestParam(defaultValue = "DESC") String sortDir, 
            @RequestParam(required = false) String search // Tìm kiếm theo email hoặc fullName
    ) {
        Sort.Direction direction = sortDir.equalsIgnoreCase("ASC") 
            ? Sort.Direction.ASC 
            : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy)); 
        Page<AdminUserDTO> users = adminUserService.getUsers(pageable, search); 
        return ResponseEntity.ok(users); // Trả về Page<AdminUserDTO> (chứa danh sách + thông tin phân trang)
    }

    // Đổi trạng thái Active <-> Locked
    @PutMapping("/{id}/status")
    public ResponseEntity<AdminUserDTO> updateUserStatus(
            @PathVariable Long id, // ID của user 
            @RequestBody Map<String, Object> request // { "isEnabled": true/false, "lockReason": "..." }
    ) {
        // Extract isEnabled từ request body
        Boolean isEnabled = request.get("isEnabled") instanceof Boolean 
            ? (Boolean) request.get("isEnabled")
            : null;
        // Extract lockReason từ request body (optional)
        String lockReason = request.get("lockReason") != null 
            ? request.get("lockReason").toString() 
            : null;
        
        if (isEnabled == null) {
            return ResponseEntity.badRequest().build(); // Nếu không có isEnabled → 400 Bad Request
        }
        
        AdminUserDTO updatedUser = adminUserService.updateUserStatus(id, isEnabled, lockReason); // Cập nhật trạng thái user
        return ResponseEntity.ok(updatedUser); // Trả về user đã cập nhật
    }
}

