package dev.sentomero.backend_ams.service.impl;

import dev.sentomero.backend_ams.dto.AmsUserDto;
import dev.sentomero.backend_ams.models.AmsUser;
import dev.sentomero.backend_ams.repository.AmsUserRepository;
import dev.sentomero.backend_ams.service.AmsUserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
import java.util.stream.Collectors;

@Service
public class AmsUserServiceImpl implements AmsUserService {

    private final AmsUserRepository amsUserRepository;
    private final PasswordEncoder passwordEncoder;


    @Autowired
    public AmsUserServiceImpl(AmsUserRepository amsUserRepository, 
                            PasswordEncoder passwordEncoder) {
        this.amsUserRepository = amsUserRepository;
        this.passwordEncoder = passwordEncoder;
    }


    @Override
    @Transactional
    public AmsUserDto saveUser(AmsUserDto userDto) {
        // Check if username exists
        if (amsUserRepository.findByAmsUsername(userDto.getAmsUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
    
        AmsUser newUser = new AmsUser();
        newUser.setAmsUserFname(userDto.getAmsUserFname());
        newUser.setAmsUserLname(userDto.getAmsUserLname());
        newUser.setAmsUsername(userDto.getAmsUsername());
        
        // Encode password before saving
        String encodedPassword = passwordEncoder.encode(userDto.getAmsPassword());
        newUser.setAmsUserPassword(encodedPassword);
    
        AmsUser savedUser = amsUserRepository.save(newUser);
    
        return convertToDto(savedUser);
    }

    @Override
    public List<AmsUserDto> getAllUsers() {
        return amsUserRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private AmsUserDto convertToDto(AmsUser user) {
        AmsUserDto dto = new AmsUserDto();
        dto.setId(user.getId());
        dto.setAmsUserFname(user.getAmsUserFname());
        dto.setAmsUserLname(user.getAmsUserLname());
        dto.setAmsUsername(user.getAmsUsername());
        return dto;
    }

    @Override
    public AmsUserDto getUserById(int id) {
        AmsUser existingUser = amsUserRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        AmsUserDto userDto = new AmsUserDto();
        userDto.setId(existingUser.getId());
        userDto.setAmsUserFname(existingUser.getAmsUserFname());
        userDto.setAmsUserLname(existingUser.getAmsUserLname());
        userDto.setAmsUsername(existingUser.getAmsUsername());
        return userDto;
    }

    @Override
    public AmsUserDto updateUser(int id, AmsUserDto userDto) {
        AmsUser existingUser = amsUserRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        existingUser.setAmsUserFname(userDto.getAmsUserFname());
        existingUser.setAmsUserLname(userDto.getAmsUserLname());
        existingUser.setAmsUsername(userDto.getAmsUsername());

        if (userDto.getAmsPassword() != null && !userDto.getAmsPassword().isEmpty()) {
            existingUser.setAmsUserPassword(passwordEncoder.encode(userDto.getAmsPassword()));  // Hash updated password
        }

        AmsUser savedUser = amsUserRepository.save(existingUser);

        AmsUserDto savedUserDto = new AmsUserDto();
        savedUserDto.setId(savedUser.getId());
        savedUserDto.setAmsUserFname(savedUser.getAmsUserFname());
        savedUserDto.setAmsUserLname(savedUser.getAmsUserLname());
        savedUserDto.setAmsUsername(savedUser.getAmsUsername());

        return savedUserDto;
    }

    @Override
    public void deleteUser(int id) {
        if (amsUserRepository.existsById(id)) {
            amsUserRepository.deleteById(id);
        } else {
            throw new RuntimeException("User not found with ID: " + id);
        }
    }

    @Override
    public AmsUser findByUsername(String amsUsername) {
        return amsUserRepository.findByAmsUsername(amsUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

}
