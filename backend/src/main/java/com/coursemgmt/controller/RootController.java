package com.coursemgmt.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Root controller để handle root path và tránh NoResourceFoundException
 */
@RestController
@RequestMapping("/")
public class RootController {

    /**
     * GET /
     * Root endpoint - redirect to health check
     */
    @GetMapping
    public ResponseEntity<Map<String, String>> root() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "ok");
        response.put("service", "e-learning-backend");
        response.put("message", "API is running. Use /api/auth/health for health check.");
        response.put("health", "/api/auth/health");
        return ResponseEntity.ok(response);
    }
}

