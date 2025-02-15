package dev.sentomero.backend_ams.controller;

import dev.sentomero.backend_ams.dto.AmsUserDto;
import dev.sentomero.backend_ams.dto.LoginRequest;
import dev.sentomero.backend_ams.models.AmsUser;
import dev.sentomero.backend_ams.security.JwtTokenService;
import dev.sentomero.backend_ams.service.AmsUserService;

import lombok.AllArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/Ams/users")
@AllArgsConstructor
public class AuthController {

    private AuthenticationManager authenticationManager;

    private JwtTokenService jwtTokenService;

    private AmsUserService amsUserService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            // Authenticate the user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getAmsUsername(),
                            loginRequest.getAmsUserPassword()
                    )
            );

            // Set the authentication in the SecurityContextHolder
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Generate JWT tokens or session details
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            AmsUser authenticatedAmsUser = amsUserService.findByUsername(userDetails.getUsername());

            AmsUserDto amsUserDto = convertToDto(authenticatedAmsUser);

            String accessToken = jwtTokenService.generateAccessToken(userDetails);
            String refreshToken = jwtTokenService.generateRefreshToken(userDetails);

            System.out.println("Generated Access Token: " + accessToken);
            System.out.println("Generated Refresh Token: " + refreshToken);


            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("accessToken", accessToken);
            responseBody.put("refreshToken", refreshToken);
            responseBody.put("amsUsername", amsUserDto.getAmsUsername());
            responseBody.put("amsUserFname", amsUserDto.getAmsUserFname());
            responseBody.put("amsUserLname", amsUserDto.getAmsUserLname());
            responseBody.put("id", amsUserDto.getId());

            // Return the tokens in the response
            return ResponseEntity.ok()
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .body(responseBody);

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }

    private AmsUserDto convertToDto(AmsUser amsUser) {
        AmsUserDto dto = new AmsUserDto();
        dto.setId(amsUser.getId());
        dto.setAmsUserFname(amsUser.getAmsUserFname());
        dto.setAmsUserLname(amsUser.getAmsUserLname());
        dto.setAmsUsername(amsUser.getAmsUsername());
        return dto;
    }
}