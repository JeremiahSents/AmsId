package dev.sentomero.backend_ams.repository;

import dev.sentomero.backend_ams.models.DeletedSerialNumber;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeletedSerialNumberRepository extends JpaRepository<DeletedSerialNumber, Long> {
    @Query("SELECT d.serialNumber FROM DeletedSerialNumber d")
    List<Long> findAllDeletedSerials();
}
