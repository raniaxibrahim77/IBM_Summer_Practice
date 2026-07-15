package com.summerpractice.autominutes.dto;

import com.summerpractice.autominutes.model.Attendee;
import com.summerpractice.autominutes.model.MeetingAttendee;
import java.util.UUID;

public class AttendeeResponse {

    private UUID id;
    private String name;
    private String email;
    private String roleInMeeting;

    public AttendeeResponse() {
    }

    public AttendeeResponse(UUID id, String name, String email, String roleInMeeting) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.roleInMeeting = roleInMeeting;
    }

    public static AttendeeResponse from(Attendee attendee) {
        return new AttendeeResponse(
                attendee.getId(),
                attendee.getName(),
                attendee.getEmail(),
                null
        );
    }

    public static AttendeeResponse from(MeetingAttendee meetingAttendee) {
        return new AttendeeResponse(
                meetingAttendee.getAttendee().getId(),
                meetingAttendee.getAttendee().getName(),
                meetingAttendee.getAttendee().getEmail(),
                meetingAttendee.getRoleInMeeting()
        );
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRoleInMeeting() {
        return roleInMeeting;
    }

    public void setRoleInMeeting(String roleInMeeting) {
        this.roleInMeeting = roleInMeeting;
    }
}