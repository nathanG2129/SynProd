package com.synprod.SynProd.service;

import com.synprod.SynProd.dto.UpdateUserRequest;
import com.synprod.SynProd.dto.UserDto;
import com.synprod.SynProd.entity.User;
import com.synprod.SynProd.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Update user information
    public UserDto updateUser(Long userId, UpdateUserRequest request) {
        // Find the user by ID
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Check if email is being changed and if so, validate uniqueness
        if (!user.getEmail().equals(request.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already exists: " + request.getEmail());
            }
        }

        // Update user fields
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());
        user.setEnabled(request.getEnabled());

        // Save the updated user
        User savedUser = userRepository.save(user);

        // Return UserDto
        return UserDto.fromUser(savedUser);
    }
}
