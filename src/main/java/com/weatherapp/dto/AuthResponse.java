package com.weatherapp.dto;

public record AuthResponse(String token, String type, long expiresIn, UserResponse user) {

    public static AuthResponse bearer(String token, long expiresInSeconds, UserResponse user) {
        return new AuthResponse(token, "Bearer", expiresInSeconds, user);
    }
}
