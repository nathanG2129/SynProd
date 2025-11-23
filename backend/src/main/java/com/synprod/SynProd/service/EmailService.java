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

    public void sendInvitationEmail(String toEmail, String token, String invitedByAdmin) {
        // Log invitation link for development
        log.info("Sending invitation email to: {}", toEmail);
        log.debug("Invitation link: {}/accept-invite?token={}", frontendUrl, token);

        // Send real email when SMTP is configured
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            if (fromEmail != null && !fromEmail.isBlank()) {
                message.setFrom(fromEmail);
            }
            message.setTo(toEmail);
            message.setSubject("You're Invited to SynProd");
            message.setText(String.format(
                    "Hello,\n\n" +
                            "You have been invited by %s to join SynProd.\n\n" +
                            "Please click the following link to accept your invitation and set your password:\n" +
                            "%s/accept-invite?token=%s\n\n" +
                            "This invitation link will expire in 7 days.\n\n" +
                            "If you didn't expect this invitation, please contact your administrator.\n\n" +
                            "Best regards,\nThe SynProd Team",
                    invitedByAdmin, frontendUrl, token));

            mailSender.send(message);
            log.info("Invitation email sent successfully to: {}", toEmail);
        } catch (Exception ex) {
            // Log error but don't throw - email failure shouldn't prevent user invitation
            log.error("Failed to send invitation email to: {}. Admin should resend invitation.", toEmail, ex);
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