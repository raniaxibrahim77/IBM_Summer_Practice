package com.summerpractice.autominutes.service;

import com.summerpractice.autominutes.dto.ActionItemResponse;
import com.summerpractice.autominutes.model.ActionItem;
import com.summerpractice.autominutes.repository.ActionItemRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ActionItemService {

    private final ActionItemRepository actionItemRepository;

    public ActionItemService(ActionItemRepository actionItemRepository) {
        this.actionItemRepository = actionItemRepository;
    }

    @Transactional(readOnly = true)
    public List<ActionItemResponse> getActionItems(String status) {
        List<ActionItem> items;
        if (status == null || status.isBlank()) {
            items = actionItemRepository.findAllByOrderByDeadlineAsc();
        } else {
            items = actionItemRepository.findByStatusOrderByDeadlineAsc(status.trim());
        }
        return items.stream().map(ActionItemResponse::from).toList();
    }

    @Transactional
    public ActionItemResponse updateStatus(UUID id, String status) {
        ActionItem item = actionItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Action item not found: " + id));
        item.setStatus(status);
        item.setUpdatedAt(LocalDateTime.now());
        return ActionItemResponse.from(actionItemRepository.save(item));
    }
}