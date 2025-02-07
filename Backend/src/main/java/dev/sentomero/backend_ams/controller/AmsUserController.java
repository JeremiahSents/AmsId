package dev.sentomero.backend_ams.controller;

import dev.sentomero.backend_ams.dto.AmsUserDto;
import dev.sentomero.backend_ams.dto.AuthResponse;
import dev.sentomero.backend_ams.dto.ErrorResponse;
import dev.sentomero.backend_ams.dto.LoginRequest;
import dev.sentomero.backend_ams.security.JwtTokenService;
import dev.sentomero.backend_ams.service.AmsUserService;
import jakarta.servlet.http.HttpSession;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequestMapping("/api/users")
public class AmsUserController {

    private final AmsUserService amsUserService;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenService jwtTokenService;

    @Autowired
    public AmsUserController(AmsUserService amsUserService, 
                           AuthenticationManager authenticationManager,
                           JwtTokenService jwtTokenService) {
        this.amsUserService = amsUserService;
        this.authenticationManager = authenticationManager;
        this.jwtTokenService = jwtTokenService;
    }

//    @PostMapping("/login")
//    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
//        System.out.println("Login attempt: " + loginRequest.getAmsUsername()); // Fix logging to match the field name
//
//        try {
//            Authentication authentication = authenticationManager.authenticate(
//                    new UsernamePasswordAuthenticationToken(
//                            loginRequest.getAmsUsername(),
//                            loginRequest.getAmsUserPassword()
//                    )
//            );
//
//            SecurityContextHolder.getContext().setAuthentication(authentication);
//            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
//
//            // Generate JWT Tokens
//            String accessToken = jwtTokenService.generateAccessToken(userDetails);
//            String refreshToken = jwtTokenService.generateRefreshToken(userDetails);
//
//            // Convert UserDetails to AmsUserDto
//            AmsUserDto userDto = amsUserService.getUserByUsername(userDetails.getUsername());
//
//            // Create response object
//            AuthResponse authResponse = new AuthResponse(accessToken, refreshToken, userDto);
//
//            return ResponseEntity.ok(authResponse);
//        } catch (AuthenticationException e) {
//            return ResponseEntity
//                    .status(HttpStatus.UNAUTHORIZED)
//                    .body(new ErrorResponse("Invalid username or password"));
//        }
//    }

    @PostMapping("/createUser")
    public ResponseEntity<AmsUserDto> createUser(@RequestBody AmsUserDto amsUserDto) {
        AmsUserDto savedUser = amsUserService.savedUser(amsUserDto);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }

    @PutMapping("/updateUser/{id}")
    public ResponseEntity<AmsUserDto> updateUser(@PathVariable("id") int id, @RequestBody AmsUserDto amsUserDto) {
        AmsUserDto updatedUser = amsUserService.updateUser(id, amsUserDto);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/deleteUser/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable("id") int id) {
        amsUserService.deleteUser(id);
        return ResponseEntity.ok("User with ID " + id + " has been deleted successfully.");
    }

    @GetMapping("/getUser/{id}")
    public ResponseEntity<AmsUserDto> getUserById(@PathVariable("id") int id) {
        AmsUserDto user = amsUserService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/AllAmsUsers")
    public ResponseEntity<List<AmsUserDto>> getAllUsers() {
        List<AmsUserDto> users = amsUserService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok("Logged out successfully");
    }
}

