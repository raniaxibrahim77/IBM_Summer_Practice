package com.summerpractice.autominutes.service;

import com.summerpractice.autominutes.dto.TranscriptCreateRequest;
import com.summerpractice.autominutes.dto.TranscriptResponse;
import com.summerpractice.autominutes.exception.ResourceAlreadyExistsException;
import com.summerpractice.autominutes.exception.ResourceNotFoundException;
import com.summerpractice.autominutes.model.Meeting;
import com.summerpractice.autominutes.model.Transcript;
import com.summerpractice.autominutes.repository.MeetingRepository;
import com.summerpractice.autominutes.repository.TranscriptRepository;
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
class TranscriptServiceTest {

    @Mock
    private TranscriptRepository transcriptRepository;

    @Mock
    private MeetingRepository meetingRepository;

    @InjectMocks
    private TranscriptService transcriptService;

    @Test
    void shouldCreateTranscriptForMeeting() {
        UUID meetingId = UUID.randomUUID();
        UUID transcriptId = UUID.randomUUID();

        Meeting meeting = new Meeting(
                "Planning meeting",
                "Release planning",
                LocalDateTime.now()
        );
        meeting.setId(meetingId);

        TranscriptCreateRequest request =
                new TranscriptCreateRequest();

        request.setContent(
                "  Meeting transcript content  "
        );

        when(
                transcriptRepository.existsByMeeting_Id(
                        meetingId
                )
        ).thenReturn(false);

        when(meetingRepository.findById(meetingId))
                .thenReturn(Optional.of(meeting));

        when(
                transcriptRepository.save(
                        any(Transcript.class)
                )
        ).thenAnswer(invocation -> {
            Transcript transcript =
                    invocation.getArgument(0);

            transcript.setId(transcriptId);
            return transcript;
        });

        TranscriptResponse response =
                transcriptService.createTranscript(
                        meetingId,
                        request
                );

        assertEquals(transcriptId, response.getId());
        assertEquals(meetingId, response.getMeetingId());

        assertEquals(
                "Meeting transcript content",
                response.getContent()
        );

        verify(transcriptRepository)
                .existsByMeeting_Id(meetingId);

        verify(meetingRepository).findById(meetingId);

        verify(transcriptRepository)
                .save(any(Transcript.class));
    }

    @Test
    void shouldRejectDuplicateTranscript() {
        UUID meetingId = UUID.randomUUID();

        TranscriptCreateRequest request =
                new TranscriptCreateRequest();

        request.setContent("Transcript content");

        when(
                transcriptRepository.existsByMeeting_Id(
                        meetingId
                )
        ).thenReturn(true);

        ResourceAlreadyExistsException exception =
                assertThrows(
                        ResourceAlreadyExistsException.class,
                        () -> transcriptService.createTranscript(
                                meetingId,
                                request
                        )
                );

        assertTrue(
                exception.getMessage()
                        .contains("Transcript already exists")
        );

        verify(transcriptRepository)
                .existsByMeeting_Id(meetingId);

        verify(meetingRepository, never())
                .findById(any());

        verify(transcriptRepository, never())
                .save(any());
    }

    @Test
    void shouldThrowWhenMeetingDoesNotExist() {
        UUID meetingId = UUID.randomUUID();

        TranscriptCreateRequest request =
                new TranscriptCreateRequest();

        request.setContent("Transcript content");

        when(
                transcriptRepository.existsByMeeting_Id(
                        meetingId
                )
        ).thenReturn(false);

        when(meetingRepository.findById(meetingId))
                .thenReturn(Optional.empty());

        ResourceNotFoundException exception =
                assertThrows(
                        ResourceNotFoundException.class,
                        () -> transcriptService.createTranscript(
                                meetingId,
                                request
                        )
                );

        assertTrue(
                exception.getMessage()
                        .contains("Meeting not found")
        );

        verify(meetingRepository).findById(meetingId);

        verify(transcriptRepository, never())
                .save(any());
    }
}