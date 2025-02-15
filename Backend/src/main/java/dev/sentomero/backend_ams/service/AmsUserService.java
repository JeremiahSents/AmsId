package dev.sentomero.backend_ams.service;

import dev.sentomero.backend_ams.dto.AmsUserDto;
import dev.sentomero.backend_ams.models.AmsUser;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public interface AmsUserService {
    AmsUserDto saveUser(AmsUserDto user);

    AmsUserDto updateUser(int id, AmsUserDto user);

    List<AmsUserDto> getAllUsers();

    AmsUserDto getUserById(int id);

    void deleteUser(int id);

    AmsUser findByUsername(String amsUsername);

    void save(AmsUser amsUser);

}
