package com.synprod.SynProd.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Value("${app.frontend-url:http://localhost:4200}")
    private String frontendUrl;

    public void sendVerificationEmail(String toEmail, String token) {
        // For development, just log the verification link
        System.out.println("=== EMAIL VERIFICATION ===");
        System.out.println("To: " + toEmail);
        System.out.println("Subject: Verify Your Email - SynProd");
        System.out.println("Verification Link: " + frontendUrl + "/verify-email?token=" + token);
        System.out.println("==========================");

        // TODO: Uncomment when real email is configured
        /*
         * SimpleMailMessage message = new SimpleMailMessage();
         * message.setFrom(fromEmail);
         * message.setTo(toEmail);
         * message.setSubject("Verify Your Email - SynProd");
         * message.setText(String.format(
         * "Welcome to SynProd!\n\n" +
         * "Please click the following link to verify your email address:\n" +
         * "%s/verify-email?token=%s\n\n" +
         * "If you didn't create an account, please ignore this email.\n\n" +
         * "Best regards,\nThe SynProd Team",
         * frontendUrl, token
         * ));
         * 
         * mailSender.send(message);
         */
    }

    public void sendPasswordResetEmail(String toEmail, String token) {
        // For development, just log the reset link
        System.out.println("=== PASSWORD RESET EMAIL ===");
        System.out.println("To: " + toEmail);
        System.out.println("Subject: Password Reset Request - SynProd");
        System.out.println("Reset Link: " + frontendUrl + "/reset-password?token=" + token);
        System.out.println("=============================");

        // TODO: Uncomment when real email is configured
        /*
         * SimpleMailMessage message = new SimpleMailMessage();
         * message.setFrom(fromEmail);
         * message.setTo(toEmail);
         * message.setSubject("Password Reset Request - SynProd");
         * message.setText(String.format(
         * "Hello,\n\n" +
         * "You have requested to reset your password. Please click the following link to reset it:\n"
         * +
         * "%s/reset-password?token=%s\n\n" +
         * "This link will expire in 24 hours.\n\n" +
         * "If you didn't request a password reset, please ignore this email.\n\n" +
         * "Best regards,\nThe SynProd Team",
         * frontendUrl, token
         * ));
         * 
         * mailSender.send(message);
         */
    }
}