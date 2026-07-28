package com.summerpractice.autominutes.service;

import com.summerpractice.autominutes.dto.MeetingCreateRequest;
import com.summerpractice.autominutes.dto.MeetingResponse;
import com.summerpractice.autominutes.dto.MeetingUpdateRequest;
import com.summerpractice.autominutes.exception.ResourceNotFoundException;
import com.summerpractice.autominutes.model.Meeting;
import com.summerpractice.autominutes.repository.AppUserRepository;
import com.summerpractice.autominutes.repository.AttendeeRepository;
import com.summerpractice.autominutes.repository.MeetingAttendeeRepository;
import com.summerpractice.autominutes.repository.MeetingRepository;
import com.summerpractice.autominutes.repository.TranscriptRepository;
import com.summerpractice.autominutes.repository.AiResultRepository;
import com.summerpractice.autominutes.repository.ActionItemRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MeetingServiceTest {

    @Mock
    private MeetingRepository meetingRepository;

    @Mock
    private AppUserRepository appUserRepository;

    @Mock
    private AttendeeRepository attendeeRepository;

    @Mock
    private MeetingAttendeeRepository meetingAttendeeRepository;

    @Mock
    private TranscriptRepository transcriptRepository;

    @Mock
    private AiResultRepository aiResultRepository;

    @Mock
    private ActionItemRepository actionItemRepository;

    @InjectMocks
    private MeetingService meetingService;

    @Test
    void shouldCreateMeeting() {
        UUID meetingId = UUID.randomUUID();

        LocalDateTime meetingDate =
                LocalDateTime.of(
                        2026,
                        7,
                        30,
                        10,
                        0
                );

        MeetingCreateRequest request =
                new MeetingCreateRequest();

        request.setTitle("Weekly planning");
        request.setDescription("Discuss current tasks");
        request.setMeetingDatetime(meetingDate);

        when(meetingRepository.save(any(Meeting.class)))
                .thenAnswer(invocation -> {
                    Meeting meeting =
                            invocation.getArgument(0);

                    meeting.setId(meetingId);
                    return meeting;
                });

        MeetingResponse response =
                meetingService.createMeeting(request);

        assertEquals(meetingId, response.getId());
        assertEquals(
                "Weekly planning",
                response.getTitle()
        );
        assertEquals(
                "Discuss current tasks",
                response.getDescription()
        );
        assertEquals(
                meetingDate,
                response.getMeetingDatetime()
        );
        assertEquals(
                "NOT_STARTED",
                response.getProcessingStatus()
        );
        assertEquals(0, response.getAttendeeCount());
        assertFalse(response.isHasTranscript());

        verify(meetingRepository)
                .save(any(Meeting.class));
    }

    @Test
    void shouldUpdateMeeting() {
        UUID meetingId = UUID.randomUUID();

        Meeting meeting = new Meeting(
                "Old title",
                "Old description",
                LocalDateTime.of(
                        2026,
                        7,
                        28,
                        10,
                        0
                )
        );

        meeting.setId(meetingId);

        MeetingUpdateRequest request =
                new MeetingUpdateRequest();

        request.setTitle("Updated title");
        request.setDescription("Updated description");

        request.setMeetingDatetime(
                LocalDateTime.of(
                        2026,
                        8,
                        1,
                        14,
                        30
                )
        );

        when(meetingRepository.findById(meetingId))
                .thenReturn(Optional.of(meeting));

        when(meetingRepository.save(meeting))
                .thenReturn(meeting);

        when(
                meetingAttendeeRepository
                        .countByMeeting_Id(meetingId)
        ).thenReturn(2L);

        when(
                transcriptRepository
                        .existsByMeeting_Id(meetingId)
        ).thenReturn(true);

        MeetingResponse response =
                meetingService.updateMeeting(
                        meetingId,
                        request
                );

        assertEquals(
                "Updated title",
                response.getTitle()
        );
        assertEquals(
                "Updated description",
                response.getDescription()
        );
        assertEquals(
                request.getMeetingDatetime(),
                response.getMeetingDatetime()
        );
        assertEquals(2, response.getAttendeeCount());
        assertTrue(response.isHasTranscript());

        verify(meetingRepository)
                .findById(meetingId);

        verify(meetingRepository)
                .save(meeting);
    }

    @Test
    void shouldThrowWhenMeetingDoesNotExist() {
        UUID meetingId = UUID.randomUUID();

        when(meetingRepository.findById(meetingId))
                .thenReturn(Optional.empty());

        ResourceNotFoundException exception =
                assertThrows(
                        ResourceNotFoundException.class,
                        () -> meetingService.getMeeting(
                                meetingId
                        )
                );

        assertTrue(
                exception.getMessage()
                        .contains("Meeting not found")
        );

        verify(meetingRepository).findById(meetingId);

        verify(meetingAttendeeRepository, never())
                .countByMeeting_Id(any());

        verify(transcriptRepository, never())
                .existsByMeeting_Id(any());
    }
}