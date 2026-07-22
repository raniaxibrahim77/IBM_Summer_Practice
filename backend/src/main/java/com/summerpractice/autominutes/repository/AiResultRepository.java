package com.summerpractice.autominutes.repository;

import com.summerpractice.autominutes.model.AiResult;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AiResultRepository extends JpaRepository<AiResult, UUID> {
    List<AiResult> findByMeetingIdOrderByGeneratedAtDesc(UUID meetingId);
}