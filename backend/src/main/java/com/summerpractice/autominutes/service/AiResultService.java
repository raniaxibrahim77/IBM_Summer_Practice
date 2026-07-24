package com.summerpractice.autominutes.service;

import com.summerpractice.autominutes.dto.ActionItemResponse;
import com.summerpractice.autominutes.dto.AiResultResponse;
import com.summerpractice.autominutes.exception.ResourceNotFoundException;
import com.summerpractice.autominutes.model.AiResult;
import com.summerpractice.autominutes.model.Meeting;
import com.summerpractice.autominutes.model.PromptTemplate;
import com.summerpractice.autominutes.model.Transcript;
import com.summerpractice.autominutes.repository.AiResultRepository;
import com.summerpractice.autominutes.repository.MeetingRepository;
import com.summerpractice.autominutes.repository.PromptTemplateRepository;
import com.summerpractice.autominutes.repository.TranscriptRepository;
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

    public AiResultService(MeetingRepository meetingRepository,
                           TranscriptRepository transcriptRepository,
                           AiResultRepository aiResultRepository,
                           PromptTemplateRepository promptTemplateRepository,
                           OllamaService ollamaService) {
        this.meetingRepository = meetingRepository;
        this.transcriptRepository = transcriptRepository;
        this.aiResultRepository = aiResultRepository;
        this.promptTemplateRepository = promptTemplateRepository;
        this.ollamaService = ollamaService;
    }

    public AiResultResponse generateAiResult(UUID meetingId) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new ResourceNotFoundException("Meeting not found: " + meetingId));

        Transcript transcript = transcriptRepository.findByMeeting_Id(meetingId)
                .orElseThrow(() -> new ResourceNotFoundException("Transcript not found for meeting: " + meetingId));

        PromptTemplate template = getOrCreateDefaultTemplate();

        String fullPrompt = template.getPromptText() + "\n\nTRANSCRIPT:\n" + transcript.getContent();

        String rawResponse = ollamaService.generate(fullPrompt);

        AiResult aiResult = new AiResult(meeting, template);
        // TODO: replace with Person B's parseRawResponse() once ready
        aiResult.setConciseSummary(rawResponse);
        aiResult.setDetailedSummary(null);
        aiResult.setKeyPoints(null);
        aiResult.setDecisions(null);
        aiResult.setFollowUpNotes(null);
        aiResult.setStatus("COMPLETED");

        AiResult saved = aiResultRepository.save(aiResult);

        meeting.setProcessingStatus("COMPLETED");
        meetingRepository.save(meeting);

        // TODO: save parsed ActionItems here once parser exists
        List<ActionItemResponse> actionItems = List.of();

        return toResponse(saved, actionItems);
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
        List<ActionItemResponse> actionItems = List.of(); // TODO: wire real items once parser exists
        return toResponse(latest, actionItems);
    }
}