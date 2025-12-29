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

    /**
     * GET /api/v1/admin/users
     * Lấy danh sách users với phân trang và tìm kiếm
     */
    @GetMapping
    public ResponseEntity<Page<AdminUserDTO>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir,
            @RequestParam(required = false) String search
    ) {
        Sort.Direction direction = sortDir.equalsIgnoreCase("ASC") 
            ? Sort.Direction.ASC 
            : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        Page<AdminUserDTO> users = adminUserService.getUsers(pageable, search);
        return ResponseEntity.ok(users);
    }

    /**
     * GET /api/v1/admin/users/{id}
     * Lấy thông tin chi tiết user
     */
    @GetMapping("/{id}")
    public ResponseEntity<AdminUserDTO> getUserById(@PathVariable Long id) {
        return adminUserService.getUserById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * PUT /api/v1/admin/users/{id}/status
     * Đổi trạng thái Active <-> Locked
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<AdminUserDTO> updateUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request
    ) {
        Boolean isEnabled = request.get("isEnabled") instanceof Boolean 
            ? (Boolean) request.get("isEnabled")
            : null;
        String lockReason = request.get("lockReason") != null 
            ? request.get("lockReason").toString() 
            : null;
        
        if (isEnabled == null) {
            return ResponseEntity.badRequest().build();
        }
        
        AdminUserDTO updatedUser = adminUserService.updateUserStatus(id, isEnabled, lockReason);
        return ResponseEntity.ok(updatedUser);
    }
}

