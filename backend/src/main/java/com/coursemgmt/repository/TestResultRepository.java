package com.coursemgmt.repository;

import com.coursemgmt.model.Test;
import com.coursemgmt.model.Test_Result;
import com.coursemgmt.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TestResultRepository extends JpaRepository<Test_Result, Long> {
    // Tìm bài nộp của 1 user cho 1 bài test
    Optional<Test_Result> findByUserAndTest(User user, Test test);

    // Lấy tất cả bài nộp của 1 bài test (cho Giảng viên)
    List<Test_Result> findByTestId(Long testId);

    // Thống kê điểm trung bình
    @Query("SELECT AVG(tr.score) FROM Test_Result tr WHERE tr.test.id = :testId AND tr.status = 'GRADED'")
    Double getAverageScoreByTestId(Long testId);

    // Tự động đếm số bài nộp cho 1 test
    Long countByTestId(Long testId);
}