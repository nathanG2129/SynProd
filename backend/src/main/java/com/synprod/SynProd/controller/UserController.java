package com.synprod.SynProd.controller;

import com.synprod.SynProd.dto.UpdateUserRequest;
import com.synprod.SynProd.dto.UserDto;
import com.synprod.SynProd.entity.Role;
import com.synprod.SynProd.entity.User;
import com.synprod.SynProd.exception.UnauthorizedException;
import com.synprod.SynProd.exception.UserNotFoundException;
import com.synprod.SynProd.repository.UserRepository;
import com.synprod.SynProd.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;

    public UserController(UserRepository userRepository, UserService userService) {
        this.userRepository = userRepository;
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserDto> getProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        return ResponseEntity.ok(UserDto.fromUser(user));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserDto> userDtos = users.stream()
                .map(UserDto::fromUser)
                .collect(Collectors.toList());
        return ResponseEntity.ok(userDtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        // Get current authenticated user from SecurityContext (already loaded by JWT filter)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        // Safe cast with type checking
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            throw new UnauthorizedException("Authentication required");
        }
        
        User currentUser = (User) authentication.getPrincipal();

        // Authorization check: Only ADMIN or the user themselves can access
        if (!currentUser.getId().equals(id) && currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("You can only access your own profile");
        }

        // If requesting own profile, return current user (avoid extra query)
        if (currentUser.getId().equals(id)) {
            return ResponseEntity.ok(UserDto.fromUser(currentUser));
        }

        // Otherwise, fetch the requested user (ADMIN accessing another user)
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));

        return ResponseEntity.ok(UserDto.fromUser(user));
    }

    // Update existing user (ADMIN only)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest request) {
        UserDto user = userService.updateUser(id, request);
        return ResponseEntity.ok(user);
    }
}