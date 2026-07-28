package com.summerpractice.autominutes.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class OllamaService {

    private final RestClient restClient = RestClient.create("http://localhost:11434");

    public String generate(String prompt) {
        Map<String, Object> options = Map.of(
                "num_ctx", 8192,
                "temperature", 0.3,
                "repeat_penalty", 1.3,
                "num_predict", 2048
        );

        Map<String, Object> requestBody = Map.of(
                "model", "llama3.2:3b",
                "prompt", prompt,
                "stream", false,
                "options", options
        );

        try {
            Map<String, Object> response = restClient.post()
                    .uri("/api/generate")
                    .body(requestBody)
                    .retrieve()
                    .body(Map.class);

            System.out.println("=== DONE REASON: " + response.get("done_reason"));
            System.out.println("=== EVAL COUNT: " + response.get("eval_count"));

            return (String) response.get("response");
        } catch (Exception e) {
            throw new IllegalStateException("Ollama is not reachable. Is it running locally?", e);
        }
    }
}