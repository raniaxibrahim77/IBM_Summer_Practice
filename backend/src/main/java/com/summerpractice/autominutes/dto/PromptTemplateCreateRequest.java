package com.summerpractice.autominutes.dto;

import jakarta.validation.constraints.NotBlank;

public class PromptTemplateCreateRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String promptText;

    private String version;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPromptText() { return promptText; }
    public void setPromptText(String promptText) { this.promptText = promptText; }

    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }
}