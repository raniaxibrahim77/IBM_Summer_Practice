package com.summerpractice.autominutes.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class MeetingAttendeeCreateRequest {

    @NotNull(message = "Attendee id is required")
    private UUID attendeeId;

    private String roleInMeeting;

    public MeetingAttendeeCreateRequest() {
    }

    public UUID getAttendeeId() {
        return attendeeId;
    }

    public void setAttendeeId(UUID attendeeId) {
        this.attendeeId = attendeeId;
    }

    public String getRoleInMeeting() {
        return roleInMeeting;
    }

    public void setRoleInMeeting(String roleInMeeting) {
        this.roleInMeeting = roleInMeeting;
    }
}