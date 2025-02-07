package dev.sentomero.backend_ams.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthenticationResponse {
    private AmsUserDto user;
}