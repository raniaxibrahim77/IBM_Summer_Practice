package com.summerpractice.autominutes.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class OllamaService {

    private final RestClient restClient = RestClient.create("http://localhost:11434");

    public String generate(String prompt) {
        Map<String, Object> requestBody = Map.of(
                "model", "llama3.2",
                "prompt", prompt,
                "stream", false
        );

        try {
            Map<String, Object> response = restClient.post()
                    .uri("/api/generate")
                    .body(requestBody)
                    .retrieve()
                    .body(Map.class);

            return (String) response.get("response");
        } catch (Exception e) {
            throw new IllegalStateException("Ollama is not reachable. Is it running locally?", e);
        }
    }
}