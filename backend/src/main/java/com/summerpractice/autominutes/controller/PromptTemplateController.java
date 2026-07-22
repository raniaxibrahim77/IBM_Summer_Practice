package com.summerpractice.autominutes.controller;

import com.summerpractice.autominutes.dto.PromptTemplateCreateRequest;
import com.summerpractice.autominutes.dto.PromptTemplateResponse;
import com.summerpractice.autominutes.service.PromptTemplateService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/prompt-templates")
public class PromptTemplateController {

    private final PromptTemplateService promptTemplateService;

    public PromptTemplateController(PromptTemplateService promptTemplateService) {
        this.promptTemplateService = promptTemplateService;
    }

    @PostMapping
    public ResponseEntity<PromptTemplateResponse> create(@Valid @RequestBody PromptTemplateCreateRequest request) {
        PromptTemplateResponse created = promptTemplateService.create(request);
        return ResponseEntity.created(URI.create("/api/prompt-templates/" + created.getId())).body(created);
    }

    @GetMapping
    public List<PromptTemplateResponse> listAll() {
        return promptTemplateService.listAll();
    }

    @GetMapping("/active")
    public PromptTemplateResponse getActiveByName(@RequestParam String name) {
        return promptTemplateService.getActiveByName(name);
    }
}