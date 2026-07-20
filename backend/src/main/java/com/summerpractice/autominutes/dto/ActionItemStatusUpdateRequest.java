package com.summerpractice.autominutes.dto;

import jakarta.validation.constraints.NotBlank;

public class ActionItemStatusUpdateRequest {

    @NotBlank
    private String status;

    public ActionItemStatusUpdateRequest() {
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}