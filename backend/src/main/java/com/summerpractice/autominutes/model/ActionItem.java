package com.summerpractice.autominutes.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "action_item")
public class ActionItem {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ai_result_id", nullable = false)
    private AiResult aiResult;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String proposedAssignee;

    private LocalDate deadline;

    private String status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public ActionItem() {
    }

    public ActionItem(AiResult aiResult, String description) {
        this.aiResult = aiResult;
        this.description = description;
        this.status = "OPEN";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public AiResult getAiResult() {
        return aiResult;
    }

    public void setAiResult(AiResult aiResult) {
        this.aiResult = aiResult;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getProposedAssignee() {
        return proposedAssignee;
    }

    public void setProposedAssignee(String proposedAssignee) {
        this.proposedAssignee = proposedAssignee;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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