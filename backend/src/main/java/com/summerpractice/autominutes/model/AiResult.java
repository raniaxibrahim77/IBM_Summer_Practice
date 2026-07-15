package com.summerpractice.autominutes.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ai_result")
public class AiResult {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prompt_template_id", nullable = false)
    private PromptTemplate promptTemplate;

    @Column(columnDefinition = "TEXT")
    private String conciseSummary;

    @Column(columnDefinition = "TEXT")
    private String detailedSummary;

    @Column(columnDefinition = "TEXT")
    private String keyPoints;

    @Column(columnDefinition = "TEXT")
    private String decisions;

    @Column(columnDefinition = "TEXT")
    private String followUpNotes;

    private String status;

    private LocalDateTime generatedAt;

    public AiResult() {
    }

    public AiResult(Meeting meeting, PromptTemplate promptTemplate) {
        this.meeting = meeting;
        this.promptTemplate = promptTemplate;
        this.status = "PENDING";
        this.generatedAt = LocalDateTime.now();
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

    public PromptTemplate getPromptTemplate() {
        return promptTemplate;
    }

    public void setPromptTemplate(PromptTemplate promptTemplate) {
        this.promptTemplate = promptTemplate;
    }

    public String getConciseSummary() {
        return conciseSummary;
    }

    public void setConciseSummary(String conciseSummary) {
        this.conciseSummary = conciseSummary;
    }

    public String getDetailedSummary() {
        return detailedSummary;
    }

    public void setDetailedSummary(String detailedSummary) {
        this.detailedSummary = detailedSummary;
    }

    public String getKeyPoints() {
        return keyPoints;
    }

    public void setKeyPoints(String keyPoints) {
        this.keyPoints = keyPoints;
    }

    public String getDecisions() {
        return decisions;
    }

    public void setDecisions(String decisions) {
        this.decisions = decisions;
    }

    public String getFollowUpNotes() {
        return followUpNotes;
    }

    public void setFollowUpNotes(String followUpNotes) {
        this.followUpNotes = followUpNotes;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }
}