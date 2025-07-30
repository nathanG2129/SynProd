package com.synprod.SynProd.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/")
    public String home() {
        return "SynProd Backend is running! 🚀";
    }

    @GetMapping("/api/test")
    public String test() {
        return "API endpoint working correctly!";
    }

    @GetMapping("/api/health")
    public String health() {
        return "Backend is healthy and operational";
    }
}