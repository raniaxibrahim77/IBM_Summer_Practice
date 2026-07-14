package com.summerpractice.autominutes.service;

import com.summerpractice.autominutes.dto.AttendeeCreateRequest;
import com.summerpractice.autominutes.dto.AttendeeResponse;
import com.summerpractice.autominutes.model.Attendee;
import com.summerpractice.autominutes.model.Meeting;
import com.summerpractice.autominutes.model.MeetingAttendee;
import com.summerpractice.autominutes.model.MeetingAttendeeId;
import com.summerpractice.autominutes.repository.AttendeeRepository;
import com.summerpractice.autominutes.repository.MeetingAttendeeRepository;
import com.summerpractice.autominutes.repository.MeetingRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AttendeeService {

    private final MeetingRepository meetingRepository;
    private final AttendeeRepository attendeeRepository;
    private final MeetingAttendeeRepository meetingAttendeeRepository;

    public AttendeeService(MeetingRepository meetingRepository,
                           AttendeeRepository attendeeRepository,
                           MeetingAttendeeRepository meetingAttendeeRepository) {
        this.meetingRepository = meetingRepository;
        this.attendeeRepository = attendeeRepository;
        this.meetingAttendeeRepository = meetingAttendeeRepository;
    }

    @Transactional
    public AttendeeResponse addAttendee(UUID meetingId, AttendeeCreateRequest request) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new IllegalArgumentException("Meeting not found: " + meetingId));

        Attendee attendee = new Attendee(request.getName(), request.getEmail());
        Attendee savedAttendee = attendeeRepository.save(attendee);

        MeetingAttendee meetingAttendee = new MeetingAttendee();
        meetingAttendee.setId(new MeetingAttendeeId(meeting.getId(), savedAttendee.getId()));
        meetingAttendee.setMeeting(meeting);
        meetingAttendee.setAttendee(savedAttendee);
        meetingAttendee.setRoleInMeeting(request.getRoleInMeeting());

        return AttendeeResponse.from(meetingAttendeeRepository.save(meetingAttendee));
    }

    @Transactional(readOnly = true)
    public List<AttendeeResponse> getAttendees(UUID meetingId) {
        if (!meetingRepository.existsById(meetingId)) {
            throw new IllegalArgumentException("Meeting not found: " + meetingId);
        }

        return meetingAttendeeRepository.findByMeeting_Id(meetingId)
                .stream()
                .map(AttendeeResponse::from)
                .toList();
    }
}