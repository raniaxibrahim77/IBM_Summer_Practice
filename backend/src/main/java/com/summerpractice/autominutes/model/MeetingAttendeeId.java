package com.summerpractice.autominutes.model;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class MeetingAttendeeId implements Serializable {

    private UUID meetingId;
    private UUID attendeeId;

    public MeetingAttendeeId() {
    }

    public MeetingAttendeeId(UUID meetingId, UUID attendeeId) {
        this.meetingId = meetingId;
        this.attendeeId = attendeeId;
    }

    public UUID getMeetingId() {
        return meetingId;
    }

    public void setMeetingId(UUID meetingId) {
        this.meetingId = meetingId;
    }

    public UUID getAttendeeId() {
        return attendeeId;
    }

    public void setAttendeeId(UUID attendeeId) {
        this.attendeeId = attendeeId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof MeetingAttendeeId)) return false;
        MeetingAttendeeId that = (MeetingAttendeeId) o;
        return Objects.equals(meetingId, that.meetingId) && Objects.equals(attendeeId, that.attendeeId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(meetingId, attendeeId);
    }
}