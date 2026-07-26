package com.summerpractice.autominutes.service;

import com.summerpractice.autominutes.dto.AskRequest;
import com.summerpractice.autominutes.dto.AskResponse;
import com.summerpractice.autominutes.exception.ResourceNotFoundException;
import com.summerpractice.autominutes.model.Transcript;
import com.summerpractice.autominutes.repository.TranscriptRepository;
import com.summerpractice.autominutes.model.PromptTemplate;
import com.summerpractice.autominutes.repository.PromptTemplateRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class AskService {

    private static final String ASK_TEMPLATE_NAME = "ask-meeting-default";

    private final TranscriptRepository transcriptRepository;
    private final OllamaService ollamaService;
    private final PromptTemplateRepository promptTemplateRepository;

    public AskService(TranscriptRepository transcriptRepository, OllamaService ollamaService, PromptTemplateRepository promptTemplateRepository) {
        this.transcriptRepository = transcriptRepository;
        this.ollamaService = ollamaService;
        this.promptTemplateRepository = promptTemplateRepository;
    }

    public AskResponse ask(UUID meetingId, AskRequest request) {
        Transcript transcript = transcriptRepository.findByMeeting_Id(meetingId)
                .orElseThrow(() -> new ResourceNotFoundException("Transcript not found for meeting: " + meetingId));

        String prompt = buildPrompt(transcript.getContent(), request);

        String answer = ollamaService.generate(prompt);

        return new AskResponse(answer);
    }

    private String buildPrompt(String transcriptContent, AskRequest request) {
        PromptTemplate askTemplate = promptTemplateRepository
                .findByNameAndActiveTrue(ASK_TEMPLATE_NAME)
                .orElseThrow(() -> new ResourceNotFoundException("Prompt template not found: " + ASK_TEMPLATE_NAME));

        StringBuilder sb = new StringBuilder();
        sb.append("You are a helpful assistant answering questions about a meeting transcript.\n\n");
        sb.append("TRANSCRIPT:\n").append(transcriptContent).append("\n\n");

        List<AskRequest.ChatMessage> history = request.getPreviousMessages();
        if (history != null && !history.isEmpty()) {
            sb.append("CONVERSATION SO FAR:\n");
            for (AskRequest.ChatMessage msg : history) {
                sb.append(msg.getRole()).append(": ").append(msg.getText()).append("\n");
            }
            sb.append("\n");
        }

        sb.append("NEW QUESTION:\n").append(request.getQuestion()).append("\n\n");
        sb.append("Answer the new question based only on the transcript and conversation above. ");
        sb.append("Be concise and direct.");

        return sb.toString();
    }
}