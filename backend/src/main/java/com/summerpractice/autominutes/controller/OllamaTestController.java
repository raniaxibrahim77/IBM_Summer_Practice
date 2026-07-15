package com.summerpractice.autominutes.controller;

import com.summerpractice.autominutes.service.OllamaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class OllamaTestController {

    private final OllamaService ollamaService;

    public OllamaTestController(OllamaService ollamaService) {
        this.ollamaService = ollamaService;
    }

    @GetMapping("/api/test-ollama")
    public String testOllama(@RequestParam String prompt) {
        return ollamaService.generate(prompt);
    }
}