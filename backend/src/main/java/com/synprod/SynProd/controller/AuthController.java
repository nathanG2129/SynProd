package com.synprod.SynProd.controller;

import com.synprod.SynProd.dto.*;
import com.synprod.SynProd.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * DEPRECATED: Public registration is disabled. Use admin invitation system instead.
     * This endpoint is kept for backward compatibility but should not be used.
     */
    @Deprecated
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(403)
                .body(AuthResponse.message("Public registration is disabled. Please contact an administrator for an invitation."));
    }

    @PostMapping("/accept-invite")
    public ResponseEntity<AuthResponse> acceptInvite(@Valid @RequestBody AcceptInviteRequest request) {
        try {
            AuthResponse response = authService.acceptInvite(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(AuthResponse.message(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(AuthResponse.message(e.getMessage()));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        try {
            AuthResponse response = authService.refreshToken(request.getRefreshToken());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(AuthResponse.message(e.getMessage()));
        }
    }

    /**
     * DEPRECATED: Email verification is no longer used. Invitation system replaces this.
     */
    @Deprecated
    @PostMapping("/verify-email")
    public ResponseEntity<AuthResponse> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        return ResponseEntity.status(410)
                .body(AuthResponse.message("Email verification is deprecated. Use the invitation system."));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<AuthResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            AuthResponse response = authService.forgotPassword(request.getEmail());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(AuthResponse.message(e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<AuthResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            AuthResponse response = authService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(AuthResponse.message(e.getMessage()));
        }
    }
}