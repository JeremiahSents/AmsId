package dev.sentomero.backend_ams.repository;

import dev.sentomero.backend_ams.models.ReservedSerialNumber;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReservedSerialNumberRepository extends JpaRepository<ReservedSerialNumber, Long> {

    @Query("SELECT r.serialNumber FROM ReservedSerialNumber r")
    List<Long> findAllReservedSerials();

    Optional<ReservedSerialNumber> findBySerialNumber(Long serialNumber);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM reserved_serial_number WHERE reserved_at < NOW() - INTERVAL '1 hour'", nativeQuery = true)
    void cleanupOldReservations();
}
