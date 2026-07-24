package com.summerpractice.autominutes.repository;

import com.summerpractice.autominutes.model.ActionItem;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActionItemRepository extends JpaRepository<ActionItem, UUID> {
    List<ActionItem> findAllByOrderByDeadlineAsc();
    List<ActionItem> findByStatusOrderByDeadlineAsc(String status);
    List<ActionItem> findByAiResultId(UUID aiResultId);
}