package com.synprod.SynProd.service;

import com.synprod.SynProd.dto.UpdateUserRequest;
import com.synprod.SynProd.dto.UserDto;
import com.synprod.SynProd.entity.User;
import com.synprod.SynProd.exception.DuplicateResourceException;
import com.synprod.SynProd.exception.UserNotFoundException;
import com.synprod.SynProd.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
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
        user.setEnabled(request.getEnabled());

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
