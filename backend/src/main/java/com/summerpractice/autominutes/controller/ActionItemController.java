package com.summerpractice.autominutes.controller;

import com.summerpractice.autominutes.dto.ActionItemResponse;
import com.summerpractice.autominutes.dto.ActionItemStatusUpdateRequest;
import com.summerpractice.autominutes.service.ActionItemService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/action-items")
public class ActionItemController {

    private final ActionItemService actionItemService;

    public ActionItemController(ActionItemService actionItemService) {
        this.actionItemService = actionItemService;
    }

    @GetMapping
    public List<ActionItemResponse> getActionItems(@RequestParam(required = false) String status) {
        return actionItemService.getActionItems(status);
    }

    @PatchMapping("/{id}/status")
    public ActionItemResponse updateStatus(@PathVariable UUID id,
                                           @Valid @RequestBody ActionItemStatusUpdateRequest request) {
        return actionItemService.updateStatus(id, request.getStatus());
    }
}