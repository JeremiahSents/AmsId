package dev.sentomero.backend_ams.controller;

import dev.sentomero.backend_ams.dto.AmsUserDto;
import dev.sentomero.backend_ams.service.AmsUserService;
import jakarta.servlet.http.HttpSession;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequestMapping("/Ams/users")
public class AmsUserController {

    private final AmsUserService amsUserService;

    @Autowired
    public AmsUserController(AmsUserService amsUserService) {
        this.amsUserService = amsUserService;

    }

    @PostMapping("/createUser")
    public ResponseEntity<AmsUserDto> createUser(@RequestBody AmsUserDto amsUserDto) {
        AmsUserDto savedUser = amsUserService.saveUser(amsUserDto);

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

    @GetMapping("/all")
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

