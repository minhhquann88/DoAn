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
@PreAuthorize("hasRole('ADMIN')") // Chỉ Admin mới được truy cập tất cả endpoint trong controller này
public class AdminUserController {

    @Autowired
    private AdminUserService adminUserService;

    // Lấy danh sách users với phân trang và tìm kiếm
    @GetMapping
    public ResponseEntity<Page<AdminUserDTO>> getUsers(
            @RequestParam(defaultValue = "0") int page, // Số trang (bắt đầu từ 0)
            @RequestParam(defaultValue = "10") int size, // Số lượng items mỗi trang
            @RequestParam(defaultValue = "createdAt") String sortBy, // Sắp xếp theo field nào
            @RequestParam(defaultValue = "DESC") String sortDir, // Hướng sắp xếp: ASC hoặc DESC
            @RequestParam(required = false) String search // Tìm kiếm theo email hoặc fullName (optional)
    ) {
        Sort.Direction direction = sortDir.equalsIgnoreCase("ASC") 
            ? Sort.Direction.ASC 
            : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy)); // Tạo Pageable với phân trang và sắp xếp
        
        Page<AdminUserDTO> users = adminUserService.getUsers(pageable, search); // Gọi service → Query database với filter và phân trang
        return ResponseEntity.ok(users); // Trả về Page<AdminUserDTO> (chứa danh sách + thông tin phân trang)
    }

    // Lấy thông tin chi tiết user
    @GetMapping("/{id}")
    public ResponseEntity<AdminUserDTO> getUserById(@PathVariable Long id) { // @PathVariable → Lấy id từ URL path
        return adminUserService.getUserById(id) // Tìm user theo ID → Trả về Optional<AdminUserDTO>
            .map(ResponseEntity::ok) // Nếu có → 200 OK
            .orElse(ResponseEntity.notFound().build()); // Nếu không có → 404 Not Found
    }

    // Đổi trạng thái Active <-> Locked
    @PutMapping("/{id}/status")
    public ResponseEntity<AdminUserDTO> updateUserStatus(
            @PathVariable Long id, // ID của user cần cập nhật
            @RequestBody Map<String, Object> request // Body: { "isEnabled": true/false, "lockReason": "..." }
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

