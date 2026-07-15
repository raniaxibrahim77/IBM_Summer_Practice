package com.summerpractice.autominutes.controller;

import com.summerpractice.autominutes.dto.AttendeeResponse;
import com.summerpractice.autominutes.dto.MeetingAttendeeCreateRequest;
import com.summerpractice.autominutes.service.MeetingAttendeeService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/meetings/{meetingId}/attendees")
public class MeetingAttendeeController {

    private final MeetingAttendeeService meetingAttendeeService;

    public MeetingAttendeeController(MeetingAttendeeService meetingAttendeeService) {
        this.meetingAttendeeService = meetingAttendeeService;
    }

    @PostMapping
    public ResponseEntity<AttendeeResponse> addAttendee(
            @PathVariable UUID meetingId,
            @Valid @RequestBody MeetingAttendeeCreateRequest request
    ) {
        AttendeeResponse attendee = meetingAttendeeService.addAttendee(meetingId, request);

        return ResponseEntity
                .created(URI.create("/api/meetings/" + meetingId + "/attendees/" + attendee.getId()))
                .body(attendee);
    }

    @GetMapping
    public List<AttendeeResponse> getAttendees(@PathVariable UUID meetingId) {
        return meetingAttendeeService.getAttendees(meetingId);
    }

    @DeleteMapping("/{attendeeId}")
    public ResponseEntity<Void> removeAttendee(
            @PathVariable UUID meetingId,
            @PathVariable UUID attendeeId
    ) {
        meetingAttendeeService.removeAttendee(meetingId, attendeeId);
        return ResponseEntity.noContent().build();
    }
}