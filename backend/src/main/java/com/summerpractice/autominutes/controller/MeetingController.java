package com.summerpractice.autominutes.controller;

import com.summerpractice.autominutes.dto.MeetingCreateRequest;
import com.summerpractice.autominutes.dto.MeetingResponse;
import com.summerpractice.autominutes.service.MeetingService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.summerpractice.autominutes.dto.MeetingUpdateRequest;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("/api/meetings")
public class MeetingController {

    private final MeetingService meetingService;

    public MeetingController(MeetingService meetingService) {
        this.meetingService = meetingService;
    }

    @PostMapping
    public ResponseEntity<MeetingResponse> createMeeting(@Valid @RequestBody MeetingCreateRequest request) {
        MeetingResponse createdMeeting = meetingService.createMeeting(request);
        return ResponseEntity
                .created(URI.create("/api/meetings/" + createdMeeting.getId()))
                .body(createdMeeting);
    }

    @GetMapping
    public List<MeetingResponse> getMeetings(@RequestParam(required = false) String title) {
        return meetingService.getMeetings(title);
    }

    @GetMapping("/{id}")
    public MeetingResponse getMeeting(@PathVariable UUID id) {
        return meetingService.getMeeting(id);
    }

    @PutMapping("/{id}")
    public MeetingResponse updateMeeting(@PathVariable UUID id,
                                         @Valid @RequestBody MeetingUpdateRequest request) {
        return meetingService.updateMeeting(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeeting(@PathVariable UUID id) {
        meetingService.deleteMeeting(id);
        return ResponseEntity.noContent().build();
    }
}