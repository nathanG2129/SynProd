package com.synprod.SynProd.service;

import com.synprod.SynProd.dto.InviteUserRequest;
import com.synprod.SynProd.dto.UpdateUserRequest;
import com.synprod.SynProd.dto.UserDto;
import com.synprod.SynProd.entity.User;
import com.synprod.SynProd.entity.UserStatus;
import com.synprod.SynProd.exception.DuplicateResourceException;
import com.synprod.SynProd.exception.UserNotFoundException;
import com.synprod.SynProd.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final EmailService emailService;

    public UserService(UserRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public UserDto inviteUser(InviteUserRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User with this email already exists or has been invited");
        }

        // Get the admin who is inviting
        User admin = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String invitedBy = admin.getFullName();

        // Create new user in PENDING status
        User user = new User();
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());
        user.setStatus(UserStatus.PENDING);
        user.setInviteToken(UUID.randomUUID().toString());
        user.setInviteTokenExpiry(LocalDateTime.now().plusDays(7)); // 7 day expiry

        // Save user
        User savedUser = userRepository.save(user);

        // Send invitation email
        emailService.sendInvitationEmail(savedUser.getEmail(), savedUser.getInviteToken(), invitedBy);

        return UserDto.fromUser(savedUser);
    }

    // Update user information
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public UserDto updateUser(Long userId, UpdateUserRequest request) {
        // Find the user by ID
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        // Update user fields
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());
        user.setStatus(request.getStatus());

        // Save the updated user - let database unique constraint handle race conditions
        try {
            User savedUser = userRepository.save(user);
            return UserDto.fromUser(savedUser);
        } catch (DataIntegrityViolationException e) {
            // Database constraint violation (likely duplicate email)
            throw new DuplicateResourceException("Email already exists: " + request.getEmail());
        }
    }
}
