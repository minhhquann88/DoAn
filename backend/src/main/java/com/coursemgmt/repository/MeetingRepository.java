package com.coursemgmt.repository;

import com.coursemgmt.model.Meeting;
import com.coursemgmt.model.EMeetingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {

    Optional<Meeting> findByMeetingCode(String meetingCode);

    List<Meeting> findByCourseId(Long courseId);

    List<Meeting> findByInstructorId(Long instructorId);

    List<Meeting> findByCourseIdAndStatus(Long courseId, EMeetingStatus status);

    List<Meeting> findByStatus(EMeetingStatus status);

    boolean existsByMeetingCode(String meetingCode);
}

