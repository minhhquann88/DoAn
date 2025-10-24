package com.coursemgmt.repository;

import com.coursemgmt.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository // Đánh dấu đây là một Spring Bean (cho tầng Repository)
public interface CourseRepository extends JpaRepository<Course, Long> {
    // JpaRepository<TênModel, KiểuDữLiệuCủaKhóaChính>

    // Chỉ cần định nghĩa interface này, Spring Data JPA sẽ tự động
    // cung cấp cho bạn các hàm:
    // 1. save()           (Tạo mới / Cập nhật)
    // 2. findById()       (Tìm theo ID)
    // 3. findAll()        (Lấy tất cả)
    // 4. deleteById()     (Xóa theo ID)
    // 5. ... và rất nhiều hàm khác
}