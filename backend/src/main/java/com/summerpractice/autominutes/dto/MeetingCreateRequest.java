package com.summerpractice.autominutes.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class MeetingCreateRequest {

    @NotBlank(message = "Meeting title is required")
    private String title;

    private String description;

    private LocalDateTime meetingDatetime;

    public MeetingCreateRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getMeetingDatetime() {
        return meetingDatetime;
    }

    public void setMeetingDatetime(LocalDateTime meetingDatetime) {
        this.meetingDatetime = meetingDatetime;
    }
}