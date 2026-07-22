package com.summerpractice.autominutes.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class AiResultResponse {

    private UUID id;
    private String conciseSummary;
    private String detailedSummary;
    private String keyPoints;
    private String decisions;
    private String followUpNotes;
    private String status;
    private LocalDateTime generatedAt;
    private List<ActionItemResponse> actionItems;

    public AiResultResponse() {
    }

    public AiResultResponse(UUID id, String conciseSummary, String detailedSummary, String keyPoints,
                            String decisions, String followUpNotes, String status,
                            LocalDateTime generatedAt, List<ActionItemResponse> actionItems) {
        this.id = id;
        this.conciseSummary = conciseSummary;
        this.detailedSummary = detailedSummary;
        this.keyPoints = keyPoints;
        this.decisions = decisions;
        this.followUpNotes = followUpNotes;
        this.status = status;
        this.generatedAt = generatedAt;
        this.actionItems = actionItems;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public List<ActionItemResponse> getActionItems() {
        return actionItems;
    }

    public void setActionItems(List<ActionItemResponse> actionItems) {
        this.actionItems = actionItems;
    }
}