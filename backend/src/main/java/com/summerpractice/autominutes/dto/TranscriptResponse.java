package com.summerpractice.autominutes.dto;

import com.summerpractice.autominutes.model.Transcript;
import java.time.LocalDateTime;
import java.util.UUID;

public class TranscriptResponse {

    private UUID id;
    private UUID meetingId;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TranscriptResponse() {
    }

    public TranscriptResponse(UUID id, UUID meetingId, String content,
                              LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.meetingId = meetingId;
        this.content = content;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static TranscriptResponse from(Transcript transcript) {
        return new TranscriptResponse(
                transcript.getId(),
                transcript.getMeeting().getId(),
                transcript.getContent(),
                transcript.getCreatedAt(),
                transcript.getUpdatedAt()
        );
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getMeetingId() {
        return meetingId;
    }

    public void setMeetingId(UUID meetingId) {
        this.meetingId = meetingId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
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
}