package com.synprod.SynProd.service;

import com.synprod.SynProd.dto.AcceptInviteRequest;
import com.synprod.SynProd.dto.AuthRequest;
import com.synprod.SynProd.dto.AuthResponse;
import com.synprod.SynProd.entity.User;
import com.synprod.SynProd.entity.UserStatus;
import com.synprod.SynProd.exception.InvalidTokenException;
import com.synprod.SynProd.exception.UserNotFoundException;
import com.synprod.SynProd.repository.UserRepository;
import com.synprod.SynProd.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            AuthenticationManager authenticationManager,
            EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
    }

    @Transactional
    public AuthResponse acceptInvite(AcceptInviteRequest request) {
        // Find user by invite token
        User user = userRepository.findByInviteToken(request.getToken())
                .orElseThrow(() -> new InvalidTokenException("Invalid invitation token"));

        // Check if token has expired
        if (user.getInviteTokenExpiry() == null || user.getInviteTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new InvalidTokenException("Invitation token has expired. Please contact your administrator.");
        }

        // Check if user is in PENDING status
        if (user.getStatus() != UserStatus.PENDING) {
            throw new InvalidTokenException("This invitation has already been used.");
        }

        // Set user details
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setStatus(UserStatus.ACTIVE);
        user.setInviteToken(null);
        user.setInviteTokenExpiry(null);

        // Save user
        userRepository.save(user);

        return AuthResponse.message("Account activated successfully. You can now log in.");
    }

    public AuthResponse login(AuthRequest request) {
        // Authenticate user
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        // Load user details
        UserDetails userDetails = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // Check if user is active
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new InvalidTokenException("Account is not active. Please contact your administrator.");
        }

        // Generate tokens
        String token = jwtUtil.generateToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        return AuthResponse.success(token, refreshToken, user);
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtUtil.isRefreshToken(refreshToken)) {
            throw new InvalidTokenException("Invalid refresh token");
        }

        String email = jwtUtil.extractUsername(refreshToken);
        UserDetails userDetails = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // Check if user is still active
        User user = userRepository.findByEmail(email).orElseThrow();
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new InvalidTokenException("Account is not active. Please contact your administrator.");
        }

        if (jwtUtil.validateToken(refreshToken, userDetails)) {
            String newToken = jwtUtil.generateToken(userDetails);
            String newRefreshToken = jwtUtil.generateRefreshToken(userDetails);

            return AuthResponse.success(newToken, newRefreshToken, user);
        } else {
            throw new InvalidTokenException("Invalid refresh token");
        }
    }

    @Transactional
    public AuthResponse forgotPassword(String email) {
        // Prevent user enumeration: Always return success message
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // Only send reset email if user is active
            if (user.getStatus() == UserStatus.ACTIVE) {
                String resetToken = java.util.UUID.randomUUID().toString();
                user.setResetToken(resetToken);
                user.setResetTokenExpiry(LocalDateTime.now().plusHours(24));
                userRepository.save(user);

                emailService.sendPasswordResetEmail(email, resetToken);
            }
        }

        // Generic message regardless of whether user exists (prevents enumeration)
        return AuthResponse.message("If an account exists with this email, a password reset link has been sent.");
    }

    @Transactional
    public AuthResponse resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new InvalidTokenException("Invalid reset token"));

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new InvalidTokenException("Reset token has expired");
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new InvalidTokenException("Account is not active. Please contact your administrator.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        return AuthResponse.message("Password reset successfully. You can now log in with your new password.");
    }
}