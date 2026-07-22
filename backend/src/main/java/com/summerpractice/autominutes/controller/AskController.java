package com.summerpractice.autominutes.controller;

import com.summerpractice.autominutes.dto.AskRequest;
import com.summerpractice.autominutes.dto.AskResponse;
import com.summerpractice.autominutes.service.AskService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/meetings")
public class AskController {

    private final AskService askService;

    public AskController(AskService askService) {
        this.askService = askService;
    }

    @PostMapping("/{meetingId}/ask")
    public ResponseEntity<AskResponse> ask(@PathVariable UUID meetingId,
                                           @Valid @RequestBody AskRequest request) {
        AskResponse response = askService.ask(meetingId, request);
        return ResponseEntity.ok(response);
    }
}