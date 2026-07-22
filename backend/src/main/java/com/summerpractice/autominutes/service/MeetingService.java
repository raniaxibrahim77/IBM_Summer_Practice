package com.summerpractice.autominutes.service;

import com.summerpractice.autominutes.dto.MeetingCreateRequest;
import com.summerpractice.autominutes.dto.MeetingResponse;
import com.summerpractice.autominutes.model.Meeting;
import com.summerpractice.autominutes.repository.MeetingRepository;
import com.summerpractice.autominutes.dto.MeetingUpdateRequest;
import com.summerpractice.autominutes.model.AppUser;
import com.summerpractice.autominutes.repository.AppUserRepository;
import com.summerpractice.autominutes.exception.ResourceNotFoundException;
import com.summerpractice.autominutes.model.Attendee;
import com.summerpractice.autominutes.model.MeetingAttendee;
import com.summerpractice.autominutes.repository.AttendeeRepository;
import com.summerpractice.autominutes.repository.MeetingAttendeeRepository;

import java.util.List;
import java.util.UUID;
import java.util.ArrayList;
import java.util.LinkedHashSet;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final AppUserRepository appUserRepository;
    private final AttendeeRepository attendeeRepository;
    private final MeetingAttendeeRepository meetingAttendeeRepository;

    public MeetingService(MeetingRepository meetingRepository, AppUserRepository appUserRepository, AttendeeRepository attendeeRepository, MeetingAttendeeRepository meetingAttendeeRepository) {
        this.meetingRepository = meetingRepository;
        this.appUserRepository = appUserRepository;
        this.attendeeRepository = attendeeRepository;
        this.meetingAttendeeRepository = meetingAttendeeRepository;
    }

    @Transactional
    public MeetingResponse createMeeting(MeetingCreateRequest request) {
        List<UUID> attendeeIds = request.getAttendeeIds() == null
                ? List.of()
                : new ArrayList<>(new LinkedHashSet<>(request.getAttendeeIds()));

        if (attendeeIds.contains(null)) {
            throw new IllegalArgumentException(
                    "Attendee IDs must not contain null values"
            );
        }

        List<Attendee> attendees = attendeeIds.stream()
                .map(attendeeId ->
                        attendeeRepository.findById(attendeeId)
                                .orElseThrow(() ->
                                        new ResourceNotFoundException(
                                                "Attendee not found: " + attendeeId
                                        )
                                )
                )
                .toList();

        Meeting meeting = new Meeting(
                request.getTitle(),
                request.getDescription(),
                request.getMeetingDatetime()
        );

        if (request.getOwnerId() != null) {
            AppUser owner = appUserRepository.findById(request.getOwnerId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.getOwnerId()));
            meeting.setOwner(owner);
        }

        Meeting savedMeeting = meetingRepository.save(meeting);

        List<MeetingAttendee> meetingAttendees = attendees.stream()
                .map(attendee ->
                        new MeetingAttendee(
                                savedMeeting,
                                attendee,
                                null
                        )
                )
                .toList();

        meetingAttendeeRepository.saveAll(meetingAttendees);

        return MeetingResponse.from(
                savedMeeting,
                meetingAttendees.size()
        );
    }

    @Transactional(readOnly = true)
    public List<MeetingResponse> getMeetings(String title, UUID ownerId) {
        List<Meeting> meetings;
        if (ownerId == null) {
                meetings = (title == null || title.isBlank())
                                ? meetingRepository.findAllByOrderByMeetingDatetimeDesc()
                                : meetingRepository.findByTitleContainingIgnoreCaseOrderByMeetingDatetimeDesc(title.trim());
            } else {
                meetings = (title == null || title.isBlank())
                                ? meetingRepository.findByOwner_IdOrderByMeetingDatetimeDesc(ownerId)
                                : meetingRepository.findByOwner_IdAndTitleContainingIgnoreCaseOrderByMeetingDatetimeDesc(ownerId, title.trim());
            }

        return meetings.stream()
                .map(meeting -> MeetingResponse.from(
                        meeting,
                        meetingAttendeeRepository.countByMeeting_Id(
                                meeting.getId()
                        )
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public MeetingResponse getMeeting(UUID id) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Meeting not found: " + id
                        )
                );

        long attendeeCount =
                meetingAttendeeRepository.countByMeeting_Id(id);

        return MeetingResponse.from(meeting, attendeeCount);
    }

    @Transactional
    public MeetingResponse updateMeeting(UUID id, MeetingUpdateRequest request) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Meeting not found: " + id));

        meeting.setTitle(request.getTitle());
        meeting.setDescription(request.getDescription());
        meeting.setMeetingDatetime(request.getMeetingDatetime());
        meeting.setUpdatedAt(java.time.LocalDateTime.now());

        Meeting savedMeeting = meetingRepository.save(meeting);

        long attendeeCount =
                meetingAttendeeRepository.countByMeeting_Id(id);

        return MeetingResponse.from(
                savedMeeting,
                attendeeCount
        );
    }

    @Transactional
    public void deleteMeeting(UUID id) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Meeting not found: " + id));

        meetingRepository.delete(meeting);
    }
}