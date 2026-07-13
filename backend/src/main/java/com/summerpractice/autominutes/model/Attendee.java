package com.summerpractice.autominutes.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

@Entity
@Table(name = "attendee")
public class Attendee {

    @Id
    @GeneratedValue
    private UUID id;

    @NotBlank
    private String name;

    @Email
    private String email;

    public Attendee() {
    }

    public Attendee(String name, String email) {
        this.name = name;
        this.email = email;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}