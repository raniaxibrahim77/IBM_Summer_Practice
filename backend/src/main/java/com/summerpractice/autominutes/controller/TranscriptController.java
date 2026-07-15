package com.summerpractice.autominutes.controller;

import com.summerpractice.autominutes.dto.TranscriptCreateRequest;
import com.summerpractice.autominutes.dto.TranscriptResponse;
import com.summerpractice.autominutes.service.TranscriptService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/meetings/{meetingId}/transcript")
public class TranscriptController {

    private final TranscriptService transcriptService;

    public TranscriptController(TranscriptService transcriptService) {
        this.transcriptService = transcriptService;
    }

    @PostMapping
    public ResponseEntity<TranscriptResponse> createTranscript(
            @PathVariable UUID meetingId,
            @Valid @RequestBody TranscriptCreateRequest request
    ) {
        TranscriptResponse transcript = transcriptService.createTranscript(meetingId, request);

        return ResponseEntity
                .created(URI.create("/api/meetings/" + meetingId + "/transcript"))
                .body(transcript);
    }

    @GetMapping
    public TranscriptResponse getTranscript(@PathVariable UUID meetingId) {
        return transcriptService.getTranscript(meetingId);
    }

    @PutMapping
    public TranscriptResponse updateTranscript(
            @PathVariable UUID meetingId,
            @Valid @RequestBody TranscriptCreateRequest request
    ) {
        return transcriptService.updateTranscript(meetingId, request);
    }
}