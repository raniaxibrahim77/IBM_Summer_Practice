package com.summerpractice.autominutes.controller;

import com.summerpractice.autominutes.dto.AppUserResponse;
import com.summerpractice.autominutes.dto.LoginRequest;
import com.summerpractice.autominutes.dto.RegisterRequest;
import com.summerpractice.autominutes.service.AppUserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AppUserController {

    private final AppUserService appUserService;

    public AppUserController(AppUserService appUserService) {
        this.appUserService = appUserService;
    }

    @PostMapping("/register")
    public AppUserResponse register(@Valid @RequestBody RegisterRequest request) {
        return appUserService.register(request);
    }

    @PostMapping("/login")
    public AppUserResponse login(@Valid @RequestBody LoginRequest request) {
        return appUserService.login(request);
    }
}