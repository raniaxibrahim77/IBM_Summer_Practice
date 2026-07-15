package com.summerpractice.autominutes.service;

import com.summerpractice.autominutes.dto.AppUserResponse;
import com.summerpractice.autominutes.dto.LoginRequest;
import com.summerpractice.autominutes.dto.RegisterRequest;
import com.summerpractice.autominutes.model.AppUser;
import com.summerpractice.autominutes.repository.AppUserRepository;
import org.springframework.stereotype.Service;

@Service
public class AppUserService {

    private final AppUserRepository appUserRepository;

    public AppUserService(AppUserRepository appUserRepository) {
        this.appUserRepository = appUserRepository;
    }

    public AppUserResponse register(RegisterRequest request) {
        if (appUserRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already taken");
        }
        if (appUserRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }

        AppUser user = new AppUser(request.getUsername(), request.getEmail(), request.getPassword());
        AppUser saved = appUserRepository.save(user);

        return toResponse(saved);
    }

    public AppUserResponse login(LoginRequest request) {
        AppUser user = appUserRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        return toResponse(user);
    }

    private AppUserResponse toResponse(AppUser user) {
        return new AppUserResponse(user.getId(), user.getUsername(), user.getEmail(), user.getCreatedAt());
    }
}