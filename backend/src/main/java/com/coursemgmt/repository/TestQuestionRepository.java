package com.coursemgmt.repository;

import com.coursemgmt.model.Test_Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TestQuestionRepository extends JpaRepository<Test_Question, Long> {
}