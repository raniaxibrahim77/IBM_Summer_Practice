package com.summerpractice.autominutes.dto;

import com.summerpractice.autominutes.model.Meeting;
import java.time.LocalDateTime;
import java.util.UUID;

public class MeetingResponse {

    private UUID id;
    private String title;
    private String description;
    private LocalDateTime meetingDatetime;
    private String processingStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UUID ownerId;
    private long attendeeCount;

    public MeetingResponse(UUID id, String title, String description, LocalDateTime meetingDatetime,
                           String processingStatus, LocalDateTime createdAt, LocalDateTime updatedAt,
                           UUID ownerId, long attendeeCount) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.meetingDatetime = meetingDatetime;
        this.processingStatus = processingStatus;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.ownerId = ownerId;
        this.attendeeCount = attendeeCount;
    }

    public static MeetingResponse from(Meeting meeting, long attendeeCount) {
        return new MeetingResponse(
                meeting.getId(),
                meeting.getTitle(),
                meeting.getDescription(),
                meeting.getMeetingDatetime(),
                meeting.getProcessingStatus(),
                meeting.getCreatedAt(),
                meeting.getUpdatedAt(),
                meeting.getOwner() != null ? meeting.getOwner().getId() : null,
                attendeeCount
        );
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public void setMeetingDatetime(LocalDateTime meetingDatetime) {
        this.meetingDatetime = meetingDatetime;
    }

    public String getProcessingStatus() {
        return processingStatus;
    }

    public void setProcessingStatus(String processingStatus) {
        this.processingStatus = processingStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public UUID getOwnerId() { return ownerId; }

    public void setOwnerId(UUID ownerId) { this.ownerId = ownerId; }

    public long getAttendeeCount() { return attendeeCount; }

    public void setAttendeeCount(long attendeeCount) { this.attendeeCount = attendeeCount; }
}