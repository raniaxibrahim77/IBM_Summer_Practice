package com.summerpractice.autominutes.service;

import com.summerpractice.autominutes.dto.AiResultResponse;
import com.summerpractice.autominutes.exception.ResourceNotFoundException;
import com.summerpractice.autominutes.model.ActionItem;
import com.summerpractice.autominutes.model.AiResult;
import com.summerpractice.autominutes.model.Meeting;
import com.summerpractice.autominutes.model.PromptTemplate;
import com.summerpractice.autominutes.model.Transcript;
import com.summerpractice.autominutes.repository.ActionItemRepository;
import com.summerpractice.autominutes.repository.AiResultRepository;
import com.summerpractice.autominutes.repository.AttendeeRepository;
import com.summerpractice.autominutes.repository.MeetingAttendeeRepository;
import com.summerpractice.autominutes.repository.MeetingRepository;
import com.summerpractice.autominutes.repository.PromptTemplateRepository;
import com.summerpractice.autominutes.repository.TranscriptRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiResultServiceTest {

    @Mock
    private MeetingRepository meetingRepository;

    @Mock
    private TranscriptRepository transcriptRepository;

    @Mock
    private AiResultRepository aiResultRepository;

    @Mock
    private PromptTemplateRepository promptTemplateRepository;

    @Mock
    private OllamaService ollamaService;

    @Mock
    private ActionItemRepository actionItemRepository;

    @Mock
    private AttendeeRepository attendeeRepository;

    @Mock
    private MeetingAttendeeRepository meetingAttendeeRepository;

    @InjectMocks
    private AiResultService aiResultService;

    @Test
    void shouldRejectGenerationWhenTranscriptIsMissing() {
        UUID meetingId = UUID.randomUUID();

        Meeting meeting = new Meeting(
                "Planning meeting",
                "Release planning",
                LocalDateTime.of(
                        2026,
                        7,
                        30,
                        10,
                        0
                )
        );

        meeting.setId(meetingId);

        when(meetingRepository.findById(meetingId))
                .thenReturn(Optional.of(meeting));

        when(
                transcriptRepository.findByMeeting_Id(
                        meetingId
                )
        ).thenReturn(Optional.empty());

        ResourceNotFoundException exception =
                assertThrows(
                        ResourceNotFoundException.class,
                        () -> aiResultService.generateAiResult(
                                meetingId
                        )
                );

        assertTrue(
                exception.getMessage()
                        .contains("Transcript not found")
        );

        verify(meetingRepository).findById(meetingId);

        verify(transcriptRepository)
                .findByMeeting_Id(meetingId);

        verifyNoInteractions(ollamaService);

        verify(aiResultRepository, never())
                .save(any());

        verify(actionItemRepository, never())
                .save(any());
    }

    @Test
    void shouldGenerateAndPersistAiResult() {
        UUID meetingId = UUID.randomUUID();
        UUID transcriptId = UUID.randomUUID();
        UUID promptId = UUID.randomUUID();
        UUID aiResultId = UUID.randomUUID();
        UUID actionItemId = UUID.randomUUID();

        Meeting meeting = new Meeting(
                "Release planning",
                "Discuss release tasks",
                LocalDateTime.of(
                        2026,
                        7,
                        30,
                        10,
                        0
                )
        );

        meeting.setId(meetingId);

        Transcript transcript = new Transcript(
                meeting,
                "Maria will complete testing before Friday."
        );

        transcript.setId(transcriptId);

        PromptTemplate promptTemplate =
                new PromptTemplate(
                        "meeting-summary-default",
                        "Process the meeting from "
                                + "{meeting_datetime}",
                        "v1"
                );

        promptTemplate.setId(promptId);

        String ollamaResponse = """
                CONCISE_SUMMARY:
                The team discussed the upcoming release.

                DETAILED_SUMMARY:
                The team reviewed testing and deployment.

                KEY_POINTS:
                - Testing must finish before Friday.

                DECISIONS:
                - Keep the current release date.

                FOLLOW_UP_NOTES:
                Schedule another review.

                ACTION_ITEMS:
                - Complete testing | Maria | 2026-07-31

                ATTENDEES:
                none
                """;

        when(meetingRepository.findById(meetingId))
                .thenReturn(Optional.of(meeting));

        when(
                transcriptRepository.findByMeeting_Id(
                        meetingId
                )
        ).thenReturn(Optional.of(transcript));

        when(
                promptTemplateRepository
                        .findByNameAndActiveTrue(
                                "meeting-summary-default"
                        )
        ).thenReturn(Optional.of(promptTemplate));

        when(ollamaService.generate(anyString()))
                .thenReturn(ollamaResponse);

        when(aiResultRepository.save(any(AiResult.class)))
                .thenAnswer(invocation -> {
                    AiResult result =
                            invocation.getArgument(0);

                    result.setId(aiResultId);
                    return result;
                });

        when(
                actionItemRepository.save(
                        any(ActionItem.class)
                )
        ).thenAnswer(invocation -> {
            ActionItem actionItem =
                    invocation.getArgument(0);

            actionItem.setId(actionItemId);
            return actionItem;
        });

        AiResultResponse response =
                aiResultService.generateAiResult(meetingId);

        assertEquals(aiResultId, response.getId());

        assertEquals(
                "The team discussed the upcoming release.",
                response.getConciseSummary()
        );

        assertEquals(
                "The team reviewed testing and deployment.",
                response.getDetailedSummary()
        );

        assertEquals(
                "Testing must finish before Friday.",
                response.getKeyPoints()
        );

        assertEquals(
                "Keep the current release date.",
                response.getDecisions()
        );

        assertEquals(
                "Schedule another review.",
                response.getFollowUpNotes()
        );

        assertEquals("COMPLETED", response.getStatus());
        assertEquals("COMPLETED", meeting.getProcessingStatus());

        assertEquals(1, response.getActionItems().size());

        assertEquals(
                "Complete testing",
                response.getActionItems()
                        .get(0)
                        .getDescription()
        );

        assertEquals(
                "Maria",
                response.getActionItems()
                        .get(0)
                        .getProposedAssignee()
        );

        assertEquals(
                LocalDate.of(2026, 7, 31),
                response.getActionItems()
                        .get(0)
                        .getDeadline()
        );

        ArgumentCaptor<String> promptCaptor =
                ArgumentCaptor.forClass(String.class);

        verify(ollamaService)
                .generate(promptCaptor.capture());

        String generatedPrompt = promptCaptor.getValue();

        assertTrue(
                generatedPrompt.contains(
                        transcript.getContent()
                )
        );

        assertTrue(
                generatedPrompt.contains(
                        meeting.getMeetingDatetime().toString()
                )
        );

        verify(aiResultRepository)
                .save(any(AiResult.class));

        verify(actionItemRepository)
                .save(any(ActionItem.class));

        verify(meetingRepository).save(meeting);
    }

    @Test
    void shouldReturnLatestAiResultWithActionItems() {
        UUID meetingId = UUID.randomUUID();
        UUID promptId = UUID.randomUUID();
        UUID aiResultId = UUID.randomUUID();
        UUID actionItemId = UUID.randomUUID();

        Meeting meeting = new Meeting(
                "Project review",
                "Review project progress",
                LocalDateTime.of(
                        2026,
                        7,
                        30,
                        14,
                        0
                )
        );

        meeting.setId(meetingId);

        PromptTemplate promptTemplate =
                new PromptTemplate(
                        "meeting-summary-default",
                        "Summarize the transcript",
                        "v1"
                );

        promptTemplate.setId(promptId);

        AiResult aiResult =
                new AiResult(meeting, promptTemplate);

        aiResult.setId(aiResultId);
        aiResult.setConciseSummary("Latest summary");
        aiResult.setDetailedSummary("Latest detailed summary");
        aiResult.setStatus("COMPLETED");

        ActionItem actionItem =
                new ActionItem(
                        aiResult,
                        "Send the final report"
                );

        actionItem.setId(actionItemId);
        actionItem.setStatus("OPEN");

        when(
                aiResultRepository
                        .findByMeetingIdOrderByGeneratedAtDesc(
                                meetingId
                        )
        ).thenReturn(List.of(aiResult));

        when(
                actionItemRepository.findByAiResultId(
                        aiResultId
                )
        ).thenReturn(List.of(actionItem));

        AiResultResponse response =
                aiResultService.getLatestAiResult(meetingId);

        assertEquals(aiResultId, response.getId());

        assertEquals(
                "Latest summary",
                response.getConciseSummary()
        );

        assertEquals("COMPLETED", response.getStatus());
        assertEquals(1, response.getActionItems().size());

        assertEquals(
                "Send the final report",
                response.getActionItems()
                        .get(0)
                        .getDescription()
        );

        assertEquals(
                "OPEN",
                response.getActionItems()
                        .get(0)
                        .getStatus()
        );

        verify(aiResultRepository)
                .findByMeetingIdOrderByGeneratedAtDesc(
                        meetingId
                );

        verify(actionItemRepository)
                .findByAiResultId(aiResultId);
    }
}