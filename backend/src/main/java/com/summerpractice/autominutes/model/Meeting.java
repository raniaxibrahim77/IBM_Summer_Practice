package com.summerpractice.autominutes.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "meeting")
public class Meeting {

    @Id
    @GeneratedValue
    private UUID id;

    @NotBlank
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDateTime meetingDatetime;

    private String processingStatus;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public Meeting() {
    }

    public Meeting(String title, String description, LocalDateTime meetingDatetime) {
        this.title = title;
        this.description = description;
        this.meetingDatetime = meetingDatetime;
        this.processingStatus = "NOT_STARTED";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
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
}