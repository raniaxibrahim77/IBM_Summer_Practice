package com.summerpractice.autominutes.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "prompt_template")
public class PromptTemplate {

    @Id
    @GeneratedValue
    private UUID id;

    @NotBlank
    private String name;

    @NotBlank
    @Column(columnDefinition = "TEXT")
    private String promptText;

    private String version;

    private boolean active;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public PromptTemplate() {
    }

    public PromptTemplate(String name, String promptText, String version) {
        this.name = name;
        this.promptText = promptText;
        this.version = version;
        this.active = true;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPromptText() {
        return promptText;
    }

    public void setPromptText(String promptText) {
        this.promptText = promptText;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
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