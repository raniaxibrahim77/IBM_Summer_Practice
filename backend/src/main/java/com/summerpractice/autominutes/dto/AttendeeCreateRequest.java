package com.summerpractice.autominutes.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class AttendeeCreateRequest {

    @NotBlank(message = "Attendee name is required")
    private String name;

    @Email(message = "Email must be valid")
    private String email;


    public AttendeeCreateRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}