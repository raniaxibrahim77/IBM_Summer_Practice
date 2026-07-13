package com.summerpractice.autominutes.model;

import jakarta.persistence.*;

@Entity
@Table(name = "meeting_attendee")
public class MeetingAttendee {

    @EmbeddedId
    private MeetingAttendeeId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("meetingId")
    @JoinColumn(name = "meeting_id")
    private Meeting meeting;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("attendeeId")
    @JoinColumn(name = "attendee_id")
    private Attendee attendee;

    private String roleInMeeting;

    public MeetingAttendee() {
    }

    public MeetingAttendee(Meeting meeting, Attendee attendee, String roleInMeeting) {
        this.meeting = meeting;
        this.attendee = attendee;
        this.roleInMeeting = roleInMeeting;
        this.id = new MeetingAttendeeId(meeting.getId(), attendee.getId());
    }

    public MeetingAttendeeId getId() {
        return id;
    }

    public void setId(MeetingAttendeeId id) {
        this.id = id;
    }

    public Meeting getMeeting() {
        return meeting;
    }

    public void setMeeting(Meeting meeting) {
        this.meeting = meeting;
    }

    public Attendee getAttendee() {
        return attendee;
    }

    public void setAttendee(Attendee attendee) {
        this.attendee = attendee;
    }

    public String getRoleInMeeting() {
        return roleInMeeting;
    }

    public void setRoleInMeeting(String roleInMeeting) {
        this.roleInMeeting = roleInMeeting;
    }
}