package com.summerpractice.autominutes.controller;

import com.summerpractice.autominutes.dto.AttendeeCreateRequest;
import com.summerpractice.autominutes.dto.AttendeeResponse;
import com.summerpractice.autominutes.service.AttendeeService;
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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/meetings/{meetingId}/attendees")
public class AttendeeController {

    private final AttendeeService attendeeService;

    public AttendeeController(AttendeeService attendeeService) {
        this.attendeeService = attendeeService;
    }

    @PostMapping
    public ResponseEntity<AttendeeResponse> addAttendee(@PathVariable UUID meetingId,
                                                        @Valid @RequestBody AttendeeCreateRequest request) {
        AttendeeResponse attendee = attendeeService.addAttendee(meetingId, request);

        return ResponseEntity
                .created(URI.create("/api/meetings/" + meetingId + "/attendees/" + attendee.getId()))
                .body(attendee);
    }

    @GetMapping
    public List<AttendeeResponse> getAttendees(@PathVariable UUID meetingId) {
        return attendeeService.getAttendees(meetingId);
    }
}