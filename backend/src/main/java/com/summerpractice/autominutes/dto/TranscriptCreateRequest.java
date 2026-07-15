package com.summerpractice.autominutes.dto;

import jakarta.validation.constraints.NotBlank;

public class TranscriptCreateRequest {

    @NotBlank(message = "Transcript content is required")
    private String content;

    public TranscriptCreateRequest() {
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}