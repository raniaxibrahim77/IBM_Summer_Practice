package com.summerpractice.autominutes.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class AppUserResponse {

    private UUID id;
    private String username;
    private String email;
    private LocalDateTime createdAt;

    public AppUserResponse(UUID id, String username, String email, LocalDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}