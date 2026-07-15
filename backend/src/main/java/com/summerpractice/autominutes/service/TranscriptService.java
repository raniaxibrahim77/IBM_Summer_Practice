package com.summerpractice.autominutes.service;

import com.summerpractice.autominutes.dto.TranscriptCreateRequest;
import com.summerpractice.autominutes.dto.TranscriptResponse;
import com.summerpractice.autominutes.model.Meeting;
import com.summerpractice.autominutes.model.Transcript;
import com.summerpractice.autominutes.repository.MeetingRepository;
import com.summerpractice.autominutes.repository.TranscriptRepository;
import com.summerpractice.autominutes.exception.ResourceAlreadyExistsException;
import com.summerpractice.autominutes.exception.ResourceNotFoundException;
import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TranscriptService {

    private final TranscriptRepository transcriptRepository;
    private final MeetingRepository meetingRepository;

    public TranscriptService(TranscriptRepository transcriptRepository,
                             MeetingRepository meetingRepository) {
        this.transcriptRepository = transcriptRepository;
        this.meetingRepository = meetingRepository;
    }

    @Transactional
    public TranscriptResponse createTranscript(UUID meetingId, TranscriptCreateRequest request) {
        if (transcriptRepository.existsByMeeting_Id(meetingId)) {
            throw new ResourceAlreadyExistsException("Transcript already exists for meeting: " + meetingId);
        }

        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new ResourceNotFoundException("Meeting not found: " + meetingId));

        Transcript transcript = new Transcript(
                meeting,
                request.getContent().trim()
        );

        return TranscriptResponse.from(transcriptRepository.save(transcript));
    }

    @Transactional(readOnly = true)
    public TranscriptResponse getTranscript(UUID meetingId) {
        Transcript transcript = transcriptRepository.findByMeeting_Id(meetingId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Transcript not found for meeting: " + meetingId
                ));

        return TranscriptResponse.from(transcript);
    }

    @Transactional
    public TranscriptResponse updateTranscript(UUID meetingId, TranscriptCreateRequest request) {
        Transcript transcript = transcriptRepository.findByMeeting_Id(meetingId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Transcript not found for meeting: " + meetingId
                ));

        transcript.setContent(request.getContent().trim());
        transcript.setUpdatedAt(LocalDateTime.now());

        return TranscriptResponse.from(transcriptRepository.save(transcript));
    }
}