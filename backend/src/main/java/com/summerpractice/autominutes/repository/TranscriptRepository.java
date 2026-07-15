package com.summerpractice.autominutes.repository;

import com.summerpractice.autominutes.model.Transcript;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TranscriptRepository extends JpaRepository<Transcript, UUID> {

    Optional<Transcript> findByMeeting_Id(UUID meetingId);

    boolean existsByMeeting_Id(UUID meetingId);
}