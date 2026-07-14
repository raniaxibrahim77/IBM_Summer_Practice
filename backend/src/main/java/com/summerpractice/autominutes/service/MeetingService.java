package com.summerpractice.autominutes.service;

import com.summerpractice.autominutes.dto.MeetingCreateRequest;
import com.summerpractice.autominutes.dto.MeetingResponse;
import com.summerpractice.autominutes.model.Meeting;
import com.summerpractice.autominutes.repository.MeetingRepository;
import com.summerpractice.autominutes.dto.MeetingUpdateRequest;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MeetingService {

    private final MeetingRepository meetingRepository;

    public MeetingService(MeetingRepository meetingRepository) {
        this.meetingRepository = meetingRepository;
    }

    @Transactional
    public MeetingResponse createMeeting(MeetingCreateRequest request) {
        Meeting meeting = new Meeting(
                request.getTitle(),
                request.getDescription(),
                request.getMeetingDatetime()
        );

        return MeetingResponse.from(meetingRepository.save(meeting));
    }

    @Transactional(readOnly = true)
    public List<MeetingResponse> getMeetings(String title) {
        List<Meeting> meetings;
        if (title == null || title.isBlank()) {
            meetings = meetingRepository.findAllByOrderByMeetingDatetimeDesc();
        } else {
            meetings = meetingRepository.findByTitleContainingIgnoreCaseOrderByMeetingDatetimeDesc(title.trim());
        }

        return meetings.stream()
                .map(MeetingResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public MeetingResponse getMeeting(UUID id) {
        return meetingRepository.findById(id)
                .map(MeetingResponse::from)
                .orElseThrow(() -> new IllegalArgumentException("Meeting not found: " + id));
    }

    @Transactional
    public MeetingResponse updateMeeting(UUID id, MeetingUpdateRequest request) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Meeting not found: " + id));

        meeting.setTitle(request.getTitle());
        meeting.setDescription(request.getDescription());
        meeting.setMeetingDatetime(request.getMeetingDatetime());
        meeting.setUpdatedAt(java.time.LocalDateTime.now());

        return MeetingResponse.from(meetingRepository.save(meeting));
    }

    @Transactional
    public void deleteMeeting(UUID id) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Meeting not found: " + id));

        meetingRepository.delete(meeting);
    }
}