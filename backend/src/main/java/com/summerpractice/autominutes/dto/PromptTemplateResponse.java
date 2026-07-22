package com.summerpractice.autominutes.dto;

import com.summerpractice.autominutes.model.PromptTemplate;
import java.time.LocalDateTime;
import java.util.UUID;

public class PromptTemplateResponse {

    private UUID id;
    private String name;
    private String promptText;
    private String version;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public PromptTemplateResponse() {}

    public PromptTemplateResponse(UUID id, String name, String promptText, String version,
                                  boolean active, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.promptText = promptText;
        this.version = version;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static PromptTemplateResponse from(PromptTemplate t) {
        return new PromptTemplateResponse(
                t.getId(), t.getName(), t.getPromptText(), t.getVersion(),
                t.isActive(), t.getCreatedAt(), t.getUpdatedAt()
        );
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPromptText() { return promptText; }
    public void setPromptText(String promptText) { this.promptText = promptText; }

    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}