package com.summerpractice.autominutes.dto;

import com.summerpractice.autominutes.model.ActionItem;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class ActionItemResponse {

    private UUID id;
    private String description;
    private String proposedAssignee;
    private LocalDate deadline;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UUID aiResultId;

    public ActionItemResponse() {
    }

    public ActionItemResponse(UUID id, String description, String proposedAssignee, LocalDate deadline,
                              String status, LocalDateTime createdAt, LocalDateTime updatedAt, UUID aiResultId) {
        this.id = id;
        this.description = description;
        this.proposedAssignee = proposedAssignee;
        this.deadline = deadline;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.aiResultId = aiResultId;
    }

    public static ActionItemResponse from(ActionItem item) {
        return new ActionItemResponse(
                item.getId(),
                item.getDescription(),
                item.getProposedAssignee(),
                item.getDeadline(),
                item.getStatus(),
                item.getCreatedAt(),
                item.getUpdatedAt(),
                item.getAiResult() != null ? item.getAiResult().getId() : null
        );
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getProposedAssignee() { return proposedAssignee; }
    public void setProposedAssignee(String proposedAssignee) { this.proposedAssignee = proposedAssignee; }

    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public UUID getAiResultId() { return aiResultId; }
    public void setAiResultId(UUID aiResultId) { this.aiResultId = aiResultId; }
}