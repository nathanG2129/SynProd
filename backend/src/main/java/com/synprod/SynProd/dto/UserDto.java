package com.synprod.SynProd.dto;

import com.synprod.SynProd.entity.Role;
import com.synprod.SynProd.entity.User;
import com.synprod.SynProd.entity.UserStatus;

import java.time.LocalDateTime;

public class UserDto {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private Role role;
    private UserStatus status;
    private LocalDateTime createdAt;

    // Constructors
    public UserDto() {
    }

    public UserDto(Long id, String firstName, String lastName, String email, Role role, UserStatus status,
            LocalDateTime createdAt) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.role = role;
        this.status = status;
        this.createdAt = createdAt;
    }

    // Static factory method
    public static UserDto fromUser(User user) {
        return new UserDto(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole(),
                user.getStatus(),
                user.getCreatedAt());
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public UserStatus getStatus() {
        return status;
    }

    public void setStatus(UserStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getFullName() {
        if (firstName == null || lastName == null) {
            return email; // Return email if names not set yet (PENDING users)
        }
        return firstName + " " + lastName;
    }
}