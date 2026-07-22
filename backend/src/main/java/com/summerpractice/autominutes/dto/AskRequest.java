package com.summerpractice.autominutes.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class AskRequest {

    @NotBlank(message = "Question is required")
    private String question;

    private List<ChatMessage> previousMessages;

    public AskRequest() {
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public List<ChatMessage> getPreviousMessages() {
        return previousMessages;
    }

    public void setPreviousMessages(List<ChatMessage> previousMessages) {
        this.previousMessages = previousMessages;
    }

    public static class ChatMessage {
        private String role;
        private String text;

        public ChatMessage() {
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }

        public String getText() {
            return text;
        }

        public void setText(String text) {
            this.text = text;
        }
    }
}