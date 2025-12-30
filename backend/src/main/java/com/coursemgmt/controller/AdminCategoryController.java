package com.coursemgmt.controller;

import com.coursemgmt.model.Category;
import com.coursemgmt.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/admin/categories")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    /**
     * GET /api/v1/admin/categories
     * Lấy tất cả danh mục
     */
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return ResponseEntity.ok(categories);
    }

    /**
     * GET /api/v1/admin/categories/{id}
     * Lấy danh mục theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        return categoryRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/v1/admin/categories
     * Tạo danh mục mới
     */
    @PostMapping
    public ResponseEntity<?> createCategory(@Valid @RequestBody Map<String, String> request) {
        String name = request.get("name");
        String description = request.get("description");
        
        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Tên danh mục không được để trống"));
        }
        
        // Kiểm tra trùng tên
        if (categoryRepository.existsByName(name.trim())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("message", "Tên danh mục đã tồn tại"));
        }
        
        Category category = new Category();
        category.setName(name.trim());
        if (description != null) {
            category.setDescription(description.trim());
        }
        
        Category savedCategory = categoryRepository.save(category);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedCategory);
    }

    /**
     * PUT /api/v1/admin/categories/{id}
     * Cập nhật danh mục
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody Map<String, String> request
    ) {
        return categoryRepository.findById(id)
            .map(category -> {
                String name = request.get("name");
                String description = request.get("description");
                
                if (name != null && !name.trim().isEmpty()) {
                    // Kiểm tra trùng tên (trừ chính nó)
                    if (!category.getName().equals(name.trim()) && categoryRepository.existsByName(name.trim())) {
                        return ResponseEntity.status(HttpStatus.CONFLICT)
                            .body(Map.of("message", "Tên danh mục đã tồn tại"));
                    }
                    category.setName(name.trim());
                }
                
                if (description != null) {
                    category.setDescription(description.trim());
                }
                
                Category savedCategory = categoryRepository.save(category);
                return ResponseEntity.ok(savedCategory);
            })
            .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Không tìm thấy danh mục")));
    }

    /**
     * DELETE /api/v1/admin/categories/{id}
     * Xóa danh mục
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        if (!categoryRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        // Kiểm tra xem có khóa học nào đang sử dụng category này không
        Category category = categoryRepository.findById(id).orElse(null);
        if (category != null && category.getCourses() != null && !category.getCourses().isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("message", "Không thể xóa danh mục đang có khóa học"));
        }
        
        categoryRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Category deleted successfully"));
    }
}

