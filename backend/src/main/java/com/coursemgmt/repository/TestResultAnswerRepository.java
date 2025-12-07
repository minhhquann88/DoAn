package com.coursemgmt.repository;

import com.coursemgmt.model.Test_Result_Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TestResultAnswerRepository extends JpaRepository<Test_Result_Answer, Long> {
}