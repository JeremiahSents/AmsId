package dev.sentomero.backend_ams.dto;

public class AuthResponse {
    private String token;
    private AmsUserDto user;

    public AuthResponse(String token, String refreshToken, AmsUserDto user) {
        this.token = token;
        this.user = user;
    }

    // Getters
    public String getToken() {
        return token;
    }

    public AmsUserDto getUser() {
        return user;
    }

    // Setters (optional, but good practice)
    public void setToken(String token) {
        this.token = token;
    }

    public void setUser(AmsUserDto user) {
        this.user = user;
    }
} 