package com.summerpractice.autominutes.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class MeetingCreateRequest {

    @NotBlank(message = "Meeting title is required")
    private String title;

    private String description;

    private LocalDateTime meetingDatetime;

    private UUID ownerId;

    private List<UUID> attendeeIds = new ArrayList<>();

    public MeetingCreateRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getMeetingDatetime() {
        return meetingDatetime;
    }

    public void setMeetingDatetime(LocalDateTime meetingDatetime) { this.meetingDatetime = meetingDatetime; }

    public UUID getOwnerId() { return ownerId; }

    public void setOwnerId(UUID ownerId) { this.ownerId = ownerId; }

    public List<UUID> getAttendeeIds() { return attendeeIds; }

    public void setAttendeeIds(List<UUID> attendeeIds) { this.attendeeIds = attendeeIds; }
}