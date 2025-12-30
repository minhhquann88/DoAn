package com.coursemgmt.repository;

import com.coursemgmt.model.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    long countByChapter_Course_Id(Long courseId);
    List<Lesson> findByChapterIdOrderByPositionAsc(Long chapterId);
    List<Lesson> findByChapterId(Long chapterId);
}