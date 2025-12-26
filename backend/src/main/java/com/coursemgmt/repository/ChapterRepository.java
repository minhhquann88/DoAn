package com.coursemgmt.repository;

import com.coursemgmt.model.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, Long> {
    List<Chapter> findByCourseIdOrderByPositionAsc(Long courseId);
    
    // Fetch chapters with lessons using JOIN FETCH to avoid LAZY loading issues
    @Query("SELECT DISTINCT c FROM Chapter c LEFT JOIN FETCH c.lessons WHERE c.course.id = :courseId ORDER BY c.position ASC")
    List<Chapter> findByCourseIdWithLessons(@Param("courseId") Long courseId);
}