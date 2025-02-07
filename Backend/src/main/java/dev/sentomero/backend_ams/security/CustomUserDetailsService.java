package dev.sentomero.backend_ams.security;

import dev.sentomero.backend_ams.models.AmsUser;
import dev.sentomero.backend_ams.repository.AmsUserRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final AmsUserRepository amsUserRepository;

    public CustomUserDetailsService(AmsUserRepository amsUserRepository) {
        this.amsUserRepository = amsUserRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        AmsUser user = amsUserRepository.findByAmsUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return new User(
            user.getAmsUsername(),
            user.getAmsUserPassword(),
            new ArrayList<>()
        );
    }
}