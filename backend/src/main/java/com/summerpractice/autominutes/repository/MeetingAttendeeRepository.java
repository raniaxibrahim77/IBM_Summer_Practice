package com.summerpractice.autominutes.repository;

import com.summerpractice.autominutes.model.MeetingAttendee;
import com.summerpractice.autominutes.model.MeetingAttendeeId;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MeetingAttendeeRepository extends JpaRepository<MeetingAttendee, MeetingAttendeeId> {

    List<MeetingAttendee> findByMeeting_IdOrderByAttendee_NameAsc(UUID meetingId);

    long countByMeeting_Id(UUID meetingId);
}