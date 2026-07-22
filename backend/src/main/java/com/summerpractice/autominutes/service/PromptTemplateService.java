package com.summerpractice.autominutes.service;

import com.summerpractice.autominutes.dto.PromptTemplateCreateRequest;
import com.summerpractice.autominutes.dto.PromptTemplateResponse;
import com.summerpractice.autominutes.exception.ResourceNotFoundException;
import com.summerpractice.autominutes.model.PromptTemplate;
import com.summerpractice.autominutes.repository.PromptTemplateRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PromptTemplateService {

    private final PromptTemplateRepository promptTemplateRepository;

    public PromptTemplateService(PromptTemplateRepository promptTemplateRepository) {
        this.promptTemplateRepository = promptTemplateRepository;
    }

    public PromptTemplateResponse create(PromptTemplateCreateRequest request) {
        PromptTemplate template = new PromptTemplate(
                request.getName(),
                request.getPromptText(),
                request.getVersion()
        );
        return PromptTemplateResponse.from(promptTemplateRepository.save(template));
    }

    public List<PromptTemplateResponse> listAll() {
        return promptTemplateRepository.findAll().stream()
                .map(PromptTemplateResponse::from)
                .toList();
    }

    public PromptTemplateResponse getActiveByName(String name) {
        PromptTemplate template = promptTemplateRepository.findByNameAndActiveTrue(name)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No active prompt template found with name: " + name));
        return PromptTemplateResponse.from(template);
    }
}