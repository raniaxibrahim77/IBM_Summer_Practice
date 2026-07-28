package com.summerpractice.autominutes.service;

import com.summerpractice.autominutes.dto.ActionItemResponse;
import com.summerpractice.autominutes.dto.AiResultResponse;
import com.summerpractice.autominutes.exception.ResourceNotFoundException;
import com.summerpractice.autominutes.model.AiResult;
import com.summerpractice.autominutes.model.Meeting;
import com.summerpractice.autominutes.model.PromptTemplate;
import com.summerpractice.autominutes.model.Transcript;
import com.summerpractice.autominutes.model.ActionItem;
import com.summerpractice.autominutes.model.Attendee;
import com.summerpractice.autominutes.model.MeetingAttendee;
import com.summerpractice.autominutes.repository.AttendeeRepository;
import com.summerpractice.autominutes.repository.AiResultRepository;
import com.summerpractice.autominutes.repository.MeetingRepository;
import com.summerpractice.autominutes.repository.PromptTemplateRepository;
import com.summerpractice.autominutes.repository.TranscriptRepository;
import com.summerpractice.autominutes.repository.ActionItemRepository;
import com.summerpractice.autominutes.repository.MeetingAttendeeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class AiResultService {

    private static final String DEFAULT_TEMPLATE_NAME = "meeting-summary-default";

    private final MeetingRepository meetingRepository;
    private final TranscriptRepository transcriptRepository;
    private final AiResultRepository aiResultRepository;
    private final PromptTemplateRepository promptTemplateRepository;
    private final OllamaService ollamaService;
    private final ActionItemRepository actionItemRepository;
    private final AttendeeRepository attendeeRepository;
    private final MeetingAttendeeRepository meetingAttendeeRepository;

    public AiResultService(MeetingRepository meetingRepository,
                           TranscriptRepository transcriptRepository,
                           AiResultRepository aiResultRepository,
                           PromptTemplateRepository promptTemplateRepository,
                           OllamaService ollamaService,
                           ActionItemRepository actionItemRepository,
                           AttendeeRepository attendeeRepository,
                           MeetingAttendeeRepository meetingAttendeeRepository){
        this.meetingRepository = meetingRepository;
        this.transcriptRepository = transcriptRepository;
        this.aiResultRepository = aiResultRepository;
        this.promptTemplateRepository = promptTemplateRepository;
        this.ollamaService = ollamaService;
        this.actionItemRepository = actionItemRepository;
        this.attendeeRepository = attendeeRepository;
        this.meetingAttendeeRepository = meetingAttendeeRepository;
    }

    public AiResultResponse generateAiResult(UUID meetingId) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new ResourceNotFoundException("Meeting not found: " + meetingId));

        Transcript transcript = transcriptRepository.findByMeeting_Id(meetingId)
                .orElseThrow(() -> new ResourceNotFoundException("Transcript not found for meeting: " + meetingId));

        PromptTemplate template = getOrCreateDefaultTemplate();

        String promptText = template.getPromptText()
                .replace("{meeting_datetime}", meeting.getMeetingDatetime().toString());
        String fullPrompt = promptText + "\n\nTRANSCRIPT:\n" + transcript.getContent();

        String rawResponse = ollamaService.generate(fullPrompt);
        System.out.println("=== RAW OLLAMA RESPONSE ===\n" + rawResponse);

        AiResponseParser.ParsedAiResult parsed = AiResponseParser.parseRawResponse(rawResponse);

        AiResult aiResult = new AiResult(meeting, template);
        aiResult.setConciseSummary(parsed.conciseSummary());
        aiResult.setDetailedSummary(parsed.detailedSummary());
        aiResult.setKeyPoints(parsed.keyPoints());
        aiResult.setDecisions(parsed.decisions());
        aiResult.setFollowUpNotes(parsed.followUpNotes());
        aiResult.setStatus("COMPLETED");

        AiResult saved = aiResultRepository.save(aiResult);

        meeting.setProcessingStatus("COMPLETED");
        meetingRepository.save(meeting);

        List<ActionItemResponse> actionItems = saveActionItems(parsed.actionItems(), saved);

        linkAttendeesFromTranscript(parsed.attendees(), meeting);

        return toResponse(saved, actionItems);
    }

    private void linkAttendeesFromTranscript(List<String> names, Meeting meeting) {
        List<MeetingAttendee> existingLinks = meetingAttendeeRepository
                .findByMeeting_IdOrderByAttendee_NameAsc(meeting.getId());
        meetingAttendeeRepository.deleteAll(existingLinks);

        for (String rawName : names) {
            String name = rawName.strip();
            if (name.isEmpty()) {
                continue;
            }

            Attendee attendee = attendeeRepository.findAll().stream()
                    .filter(a -> a.getName().equalsIgnoreCase(name))
                    .findFirst()
                    .orElseGet(() -> attendeeRepository.save(new Attendee(name, generatePlaceholderEmail(name))));

                meetingAttendeeRepository.save(new MeetingAttendee(meeting, attendee, "Participant"));
        }
    }

    private String generatePlaceholderEmail(String name) {
        String slug = name.trim().toLowerCase().replaceAll("[^a-z0-9]+", ".");
        return slug + "@example.com";
    }

    private List<ActionItemResponse> saveActionItems(
            List<AiResponseParser.ParsedActionItem> parsedItems, AiResult aiResult) {
        return parsedItems.stream()
                .map(parsedItem -> {
                    ActionItem item = new ActionItem(aiResult, parsedItem.description());
                    item.setProposedAssignee(parsedItem.assignee());
                    item.setDeadline(parsedItem.deadline());
                    return actionItemRepository.save(item);
                })
                .map(ActionItemResponse::from)
                .toList();
    }

    private PromptTemplate getOrCreateDefaultTemplate() {
        return promptTemplateRepository.findByNameAndActiveTrue(DEFAULT_TEMPLATE_NAME)
                .orElseGet(() -> {
                    PromptTemplate placeholder = new PromptTemplate(
                            DEFAULT_TEMPLATE_NAME,
                            "Summarize the following meeting transcript. Provide a concise summary.",
                            "v0-placeholder"
                    );
                    return promptTemplateRepository.save(placeholder);
                });
    }

    private AiResultResponse toResponse(AiResult aiResult, List<ActionItemResponse> actionItems) {
        return new AiResultResponse(
                aiResult.getId(),
                aiResult.getConciseSummary(),
                aiResult.getDetailedSummary(),
                aiResult.getKeyPoints(),
                aiResult.getDecisions(),
                aiResult.getFollowUpNotes(),
                aiResult.getStatus(),
                aiResult.getGeneratedAt(),
                actionItems
        );
    }

    public AiResultResponse getLatestAiResult(UUID meetingId) {
        List<AiResult> results = aiResultRepository.findByMeetingIdOrderByGeneratedAtDesc(meetingId);
        if (results.isEmpty()) {
            throw new ResourceNotFoundException("No AI result found for meeting: " + meetingId);
        }
        AiResult latest = results.get(0);
        List<ActionItemResponse> actionItems = actionItemRepository
                .findByAiResultId(latest.getId())
                .stream()
                .map(ActionItemResponse::from)
                .toList();
        return toResponse(latest, actionItems);
    }
}