package dev.sentomero.backend_ams.repository;

import dev.sentomero.backend_ams.models.AmsUser;
import dev.sentomero.backend_ams.models.KpClient;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.List;

public interface KpClientRepository extends JpaRepository<KpClient, Integer> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT MAX(k.serialNumber) FROM KpClient k")
    Optional<Long> findHighestSerialNumber();

    @Lock(LockModeType.PESSIMISTIC_READ)
    @Query("SELECT k.serialNumber FROM KpClient k ORDER BY k.serialNumber")
    List<Long> findAllSerialNumbersOrdered();

    boolean existsBySerialNumber(Long serialNumber);

    Optional<KpClient> findBySerialNumber(long serialNumber);
}