package com.synprod.SynProd.service;

import com.synprod.SynProd.dto.AuthRequest;
import com.synprod.SynProd.dto.AuthResponse;
import com.synprod.SynProd.dto.RegisterRequest;
import com.synprod.SynProd.entity.User;
import com.synprod.SynProd.exception.DuplicateResourceException;
import com.synprod.SynProd.exception.InvalidTokenException;
import com.synprod.SynProd.exception.UserNotFoundException;
import com.synprod.SynProd.repository.UserRepository;
import com.synprod.SynProd.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

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

    public AuthResponse register(RegisterRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User with this email already exists");
        }

        // Create new user
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setVerificationToken(UUID.randomUUID().toString());
        user.setVerificationTokenExpiry(LocalDateTime.now().plusHours(24)); // 24 hour expiry

        // Save user
        user = userRepository.save(user);

        // Send verification email
        emailService.sendVerificationEmail(user.getEmail(), user.getVerificationToken());

        return AuthResponse.message("Registration successful. Please check your email to verify your account.");
    }

    public AuthResponse login(AuthRequest request) {
        // Authenticate user
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        // Load user details
        UserDetails userDetails = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // Generate tokens
        String token = jwtUtil.generateToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        // Get user entity for response
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();

        return AuthResponse.success(token, refreshToken, user);
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtUtil.isRefreshToken(refreshToken)) {
            throw new InvalidTokenException("Invalid refresh token");
        }

        String email = jwtUtil.extractUsername(refreshToken);
        UserDetails userDetails = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (jwtUtil.validateToken(refreshToken, userDetails)) {
            String newToken = jwtUtil.generateToken(userDetails);
            String newRefreshToken = jwtUtil.generateRefreshToken(userDetails);

            User user = userRepository.findByEmail(email).orElseThrow();
            return AuthResponse.success(newToken, newRefreshToken, user);
        } else {
            throw new InvalidTokenException("Invalid refresh token");
        }
    }

    public AuthResponse verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new InvalidTokenException("Invalid verification token"));

        // Check if token has expired
        if (user.getVerificationTokenExpiry() != null && 
            user.getVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new InvalidTokenException("Verification token has expired. Please request a new one.");
        }

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);
        userRepository.save(user);

        return AuthResponse.message("Email verified successfully. You can now log in.");
    }

    public AuthResponse forgotPassword(String email) {
        // Prevent user enumeration: Always return success message
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String resetToken = UUID.randomUUID().toString();
            user.setResetToken(resetToken);
            user.setResetTokenExpiry(java.time.LocalDateTime.now().plusHours(24));
            userRepository.save(user);
            
            emailService.sendPasswordResetEmail(email, resetToken);
        }
        
        // Generic message regardless of whether user exists (prevents enumeration)
        return AuthResponse.message("If an account exists with this email, a password reset link has been sent.");
    }

    public AuthResponse resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new InvalidTokenException("Invalid reset token"));

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new InvalidTokenException("Reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        return AuthResponse.message("Password reset successfully. You can now log in with your new password.");
    }
}