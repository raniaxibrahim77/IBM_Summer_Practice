package com.summerpractice.autominutes.repository;

import com.summerpractice.autominutes.model.PromptTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface PromptTemplateRepository extends JpaRepository<PromptTemplate, UUID> {
    Optional<PromptTemplate> findByNameAndActiveTrue(String name);
}