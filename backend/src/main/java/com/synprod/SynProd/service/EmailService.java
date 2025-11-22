package com.synprod.SynProd.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.SimpleMailMessage;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Value("${app.frontend-url:http://localhost:4200}")
    private String frontendUrl;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(String toEmail, String token) {
        // Log verification link for development
        log.info("Sending verification email to: {}", toEmail);
        log.debug("Verification link: {}/verify-email?token={}", frontendUrl, token);

        // Send real email when SMTP is configured
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            if (fromEmail != null && !fromEmail.isBlank()) {
                message.setFrom(fromEmail);
            }
            message.setTo(toEmail);
            message.setSubject("Verify Your Email - SynProd");
            message.setText(String.format(
                    "Welcome to SynProd!\n\n" +
                            "Please click the following link to verify your email address:\n" +
                            "%s/verify-email?token=%s\n\n" +
                            "If you didn't create an account, please ignore this email.\n\n" +
                            "Best regards,\nThe SynProd Team",
                    frontendUrl, token));

            mailSender.send(message);
            log.info("Verification email sent successfully to: {}", toEmail);
        } catch (Exception ex) {
            // Log error but don't throw - email failure shouldn't prevent user registration
            log.error("Failed to send verification email to: {}. User can request resend later.", toEmail, ex);
        }
    }

    public void sendPasswordResetEmail(String toEmail, String token) {
        // Log reset link for development
        log.info("Sending password reset email to: {}", toEmail);
        log.debug("Reset link: {}/reset-password?token={}", frontendUrl, token);

        // Send real email when SMTP is configured
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            if (fromEmail != null && !fromEmail.isBlank()) {
                message.setFrom(fromEmail);
            }
            message.setTo(toEmail);
            message.setSubject("Password Reset Request - SynProd");
            message.setText(String.format(
                    "Hello,\n\n" +
                            "You have requested to reset your password. Please click the following link to reset it:\n"
                            +
                            "%s/reset-password?token=%s\n\n" +
                            "This link will expire in 24 hours.\n\n" +
                            "If you didn't request a password reset, please ignore this email.\n\n" +
                            "Best regards,\nThe SynProd Team",
                    frontendUrl, token));

            mailSender.send(message);
            log.info("Password reset email sent successfully to: {}", toEmail);
        } catch (Exception ex) {
            // Log error but don't throw - email failure shouldn't prevent password reset token creation
            log.error("Failed to send password reset email to: {}. Token is still valid if user has the link.", toEmail, ex);
        }
    }
}