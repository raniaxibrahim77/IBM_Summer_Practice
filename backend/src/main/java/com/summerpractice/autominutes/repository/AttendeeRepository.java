package com.summerpractice.autominutes.repository;

import com.summerpractice.autominutes.model.Attendee;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttendeeRepository extends JpaRepository<Attendee, UUID> {
}