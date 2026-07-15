package com.summerpractice.autominutes.repository;

import com.summerpractice.autominutes.model.Meeting;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MeetingRepository extends JpaRepository<Meeting, UUID> {

    List<Meeting> findByTitleContainingIgnoreCaseOrderByMeetingDatetimeDesc(String title);

    List<Meeting> findAllByOrderByMeetingDatetimeDesc();

    List<Meeting> findByOwnerIdOrderByMeetingDatetimeDesc(UUID ownerId);
}