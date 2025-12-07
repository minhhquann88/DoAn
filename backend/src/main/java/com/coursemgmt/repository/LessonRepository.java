package com.coursemgmt.repository;

import com.coursemgmt.model.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    long countByChapter_Course_Id(Long courseId);
}