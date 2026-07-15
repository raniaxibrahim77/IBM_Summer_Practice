package com.summerpractice.autominutes.service;

import com.summerpractice.autominutes.dto.MeetingAttendeeCreateRequest;
import com.summerpractice.autominutes.repository.AttendeeRepository;
import com.summerpractice.autominutes.dto.AttendeeResponse;
import com.summerpractice.autominutes.model.Attendee;
import com.summerpractice.autominutes.model.Meeting;
import com.summerpractice.autominutes.model.MeetingAttendee;
import com.summerpractice.autominutes.model.MeetingAttendeeId;
import com.summerpractice.autominutes.repository.MeetingAttendeeRepository;
import com.summerpractice.autominutes.repository.MeetingRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MeetingAttendeeService {

    private final MeetingRepository meetingRepository;
    private final MeetingAttendeeRepository meetingAttendeeRepository;
    private final AttendeeRepository attendeeRepository;

    public MeetingAttendeeService(
            MeetingRepository meetingRepository,
            MeetingAttendeeRepository meetingAttendeeRepository,
            AttendeeRepository attendeeRepository
    ) {
        this.meetingRepository = meetingRepository;
        this.meetingAttendeeRepository = meetingAttendeeRepository;
        this.attendeeRepository = attendeeRepository;
    }

    @Transactional
    public AttendeeResponse addAttendee(UUID meetingId, MeetingAttendeeCreateRequest request) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found: " + meetingId));

        Attendee attendee = attendeeRepository.findById(request.getAttendeeId())
                .orElseThrow(() -> new RuntimeException("Attendee not found: " + request.getAttendeeId()));

        MeetingAttendee meetingAttendee = new MeetingAttendee(
                meeting,
                attendee,
                request.getRoleInMeeting()
        );

        return AttendeeResponse.from(meetingAttendeeRepository.save(meetingAttendee));
    }

    @Transactional(readOnly = true)
    public List<AttendeeResponse> getAttendees(UUID meetingId) {
        return meetingAttendeeRepository.findByMeeting_IdOrderByAttendee_NameAsc(meetingId)
                .stream()
                .map(AttendeeResponse::from)
                .toList();
    }

    @Transactional
    public void removeAttendee(UUID meetingId, UUID attendeeId) {
        MeetingAttendeeId id = new MeetingAttendeeId(meetingId, attendeeId);

        if (!meetingAttendeeRepository.existsById(id)) {
            throw new RuntimeException("Attendee is not assigned to this meeting");
        }

        meetingAttendeeRepository.deleteById(id);
    }
}