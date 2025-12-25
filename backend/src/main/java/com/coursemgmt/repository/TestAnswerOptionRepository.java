package com.coursemgmt.repository;

import com.coursemgmt.model.Test_AnswerOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TestAnswerOptionRepository extends JpaRepository<Test_AnswerOption, Long> {
    // Chỉ cần file này tồn tại và kế thừa JpaRepository,
    // Spring sẽ tự động cung cấp các hàm save(), saveAll(), findById(), ...
}