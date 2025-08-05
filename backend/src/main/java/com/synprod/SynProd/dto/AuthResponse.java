package com.synprod.SynProd.dto;

import com.synprod.SynProd.entity.User;

public class AuthResponse {

    private String token;
    private String refreshToken;
    private UserDto user;
    private String message;

    // Constructors
    public AuthResponse() {
    }

    public AuthResponse(String token, String refreshToken, UserDto user) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.user = user;
    }

    public AuthResponse(String message) {
        this.message = message;
    }

    // Getters and Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public UserDto getUser() {
        return user;
    }

    public void setUser(UserDto user) {
        this.user = user;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    // Static factory methods
    public static AuthResponse success(String token, String refreshToken, User user) {
        return new AuthResponse(token, refreshToken, UserDto.fromUser(user));
    }

    public static AuthResponse message(String message) {
        return new AuthResponse(message);
    }
}