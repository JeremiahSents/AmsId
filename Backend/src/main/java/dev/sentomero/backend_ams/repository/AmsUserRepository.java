package dev.sentomero.backend_ams.repository;

import dev.sentomero.backend_ams.models.AmsUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AmsUserRepository extends JpaRepository<AmsUser,Integer> {
    Optional<AmsUser> findByAmsUsername(String username);
}
