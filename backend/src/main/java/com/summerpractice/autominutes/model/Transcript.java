package com.summerpractice.autominutes.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "transcript")
public class Transcript {

    @Id
    @GeneratedValue
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id", nullable = false, unique = true)
    private Meeting meeting;

    @NotBlank
    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public Transcript() {
    }

    public Transcript(Meeting meeting, String content) {
        this.meeting = meeting;
        this.content = content;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Meeting getMeeting() {
        return meeting;
    }

    public void setMeeting(Meeting meeting) {
        this.meeting = meeting;
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