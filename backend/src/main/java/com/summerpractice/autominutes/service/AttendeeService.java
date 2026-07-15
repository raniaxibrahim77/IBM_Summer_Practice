package com.summerpractice.autominutes.service;

import com.summerpractice.autominutes.dto.AttendeeCreateRequest;
import com.summerpractice.autominutes.dto.AttendeeResponse;
import com.summerpractice.autominutes.model.Attendee;
import com.summerpractice.autominutes.repository.AttendeeRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AttendeeService {

    private final AttendeeRepository attendeeRepository;

    public AttendeeService(AttendeeRepository attendeeRepository) {
        this.attendeeRepository = attendeeRepository;
    }

    @Transactional
    public Attendee createAttendee(AttendeeCreateRequest request) {
        Attendee attendee = new Attendee(
                request.getName().trim(),
                normalizeBlank(request.getEmail())
        );

        return attendeeRepository.save(attendee);
    }

    @Transactional
    public AttendeeResponse createAttendeeResponse(AttendeeCreateRequest request) {
        return AttendeeResponse.from(createAttendee(request));
    }

    @Transactional(readOnly = true)
    public List<AttendeeResponse> getAttendees() {
        return attendeeRepository.findAll()
                .stream()
                .map(AttendeeResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public AttendeeResponse getAttendee(UUID id) {
        Attendee attendee = attendeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attendee not found: " + id));

        return AttendeeResponse.from(attendee);
    }

    @Transactional
    public AttendeeResponse updateAttendee(UUID id, AttendeeCreateRequest request) {
        Attendee attendee = attendeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attendee not found: " + id));

        attendee.setName(request.getName().trim());
        attendee.setEmail(normalizeBlank(request.getEmail()));

        return AttendeeResponse.from(attendeeRepository.save(attendee));
    }

    @Transactional
    public void deleteAttendee(UUID id) {
        if (!attendeeRepository.existsById(id)) {
            throw new RuntimeException("Attendee not found: " + id);
        }

        attendeeRepository.deleteById(id);
    }

    private String normalizeBlank(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }
}