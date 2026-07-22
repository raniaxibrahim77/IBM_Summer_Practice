package com.summerpractice.autominutes.service;

import com.summerpractice.autominutes.dto.AskRequest;
import com.summerpractice.autominutes.dto.AskResponse;
import com.summerpractice.autominutes.exception.ResourceNotFoundException;
import com.summerpractice.autominutes.model.Transcript;
import com.summerpractice.autominutes.repository.TranscriptRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class AskService {

    private final TranscriptRepository transcriptRepository;
    private final OllamaService ollamaService;

    public AskService(TranscriptRepository transcriptRepository, OllamaService ollamaService) {
        this.transcriptRepository = transcriptRepository;
        this.ollamaService = ollamaService;
    }

    public AskResponse ask(UUID meetingId, AskRequest request) {
        Transcript transcript = transcriptRepository.findByMeeting_Id(meetingId)
                .orElseThrow(() -> new ResourceNotFoundException("Transcript not found for meeting: " + meetingId));

        String prompt = buildPrompt(transcript.getContent(), request);

        String answer = ollamaService.generate(prompt);

        return new AskResponse(answer);
    }

    private String buildPrompt(String transcriptContent, AskRequest request) {
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