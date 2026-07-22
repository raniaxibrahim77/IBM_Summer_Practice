package com.summerpractice.autominutes.controller;

import com.summerpractice.autominutes.dto.AiResultResponse;
import com.summerpractice.autominutes.service.AiResultService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/meetings")
public class AiResultController {

    private final AiResultService aiResultService;

    public AiResultController(AiResultService aiResultService) {
        this.aiResultService = aiResultService;
    }

    @PostMapping("/{meetingId}/generate-ai-result")
    public ResponseEntity<AiResultResponse> generateAiResult(@PathVariable UUID meetingId) {
        AiResultResponse response = aiResultService.generateAiResult(meetingId);
        return ResponseEntity.ok(response);
    }
}