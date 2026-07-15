package com.summerpractice.autominutes.controller;

import com.summerpractice.autominutes.dto.AttendeeCreateRequest;
import com.summerpractice.autominutes.dto.AttendeeResponse;
import com.summerpractice.autominutes.service.AttendeeService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/attendees")
public class AttendeeController {

    private final AttendeeService attendeeService;

    public AttendeeController(AttendeeService attendeeService) {
        this.attendeeService = attendeeService;
    }

    @PostMapping
    public ResponseEntity<AttendeeResponse> createAttendee(
            @Valid @RequestBody AttendeeCreateRequest request
    ) {
        AttendeeResponse attendee = attendeeService.createAttendeeResponse(request);

        return ResponseEntity
                .created(URI.create("/api/attendees/" + attendee.getId()))
                .body(attendee);
    }

    @GetMapping
    public List<AttendeeResponse> getAttendees() {
        return attendeeService.getAttendees();
    }

    @GetMapping("/{id}")
    public AttendeeResponse getAttendee(@PathVariable UUID id) {
        return attendeeService.getAttendee(id);
    }

    @PutMapping("/{id}")
    public AttendeeResponse updateAttendee(
            @PathVariable UUID id,
            @Valid @RequestBody AttendeeCreateRequest request
    ) {
        return attendeeService.updateAttendee(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttendee(@PathVariable UUID id) {
        attendeeService.deleteAttendee(id);
        return ResponseEntity.noContent().build();
    }
}