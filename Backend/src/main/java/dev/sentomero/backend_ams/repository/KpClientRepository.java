package dev.sentomero.backend_ams.repository;

import dev.sentomero.backend_ams.models.KpClient;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;

public interface KpClientRepository extends JpaRepository<KpClient, Integer> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT MAX(k.serialNumber) FROM KpClient k")
    Optional<Long> findHighestSerialNumber();

    @Lock(LockModeType.PESSIMISTIC_READ)
    @Query("SELECT k.serialNumber FROM KpClient k ORDER BY k.serialNumber")
    List<Long> findAllSerialNumbersOrdered();

    @Query("""
        SELECT CASE 
            WHEN EXISTS (SELECT 1 FROM KpClient k WHERE k.serialNumber = :serialNumber)
            OR EXISTS (SELECT 1 FROM DeletedSerialNumber d WHERE d.serialNumber = :serialNumber)
            OR EXISTS (SELECT 1 FROM ReservedSerialNumber r WHERE r.serialNumber = :serialNumber)
            THEN true 
            ELSE false 
        END
    """)
    boolean isSerialNumberTaken(@Param("serialNumber") Long serialNumber);

    Optional<KpClient> findBySerialNumber(long serialNumber);

    @Modifying
    @Query(value = """
        WITH moved_client AS (
            DELETE FROM kp_client 
            WHERE id = :clientId 
            RETURNING id, serial_number
        )
        INSERT INTO deleted_serial_number (serial_number, deleted_at, original_client_id)
        SELECT serial_number, CURRENT_TIMESTAMP, id 
        FROM moved_client
    """, nativeQuery = true)
    void deleteAndTrackSerialNumber(@Param("clientId") Integer clientId);

    @Query("""
        SELECT k FROM KpClient k 
        WHERE k.serialNumber > :startSerial 
        ORDER BY k.serialNumber
    """)
    List<KpClient> findAllAfterSerialNumber(@Param("startSerial") Long startSerial);

    @Query(value = """
        SELECT k.serial_number 
        FROM kp_client k 
        WHERE NOT EXISTS (
            SELECT 1 FROM deleted_serial_number d 
            WHERE d.serial_number = k.serial_number
        )
        ORDER BY k.serial_number
    """, nativeQuery = true)
    List<Long> findAllActiveSerialNumbers();

    @Query("""
        SELECT MIN(k2.serialNumber) 
        FROM KpClient k2 
        WHERE k2.serialNumber > :currentSerial 
        AND NOT EXISTS (
            SELECT 1 FROM DeletedSerialNumber d 
            WHERE d.serialNumber = k2.serialNumber
        )
        AND NOT EXISTS (
            SELECT 1 FROM ReservedSerialNumber r 
            WHERE r.serialNumber = k2.serialNumber
        )
    """)
    Optional<Long> findNextAvailableSerialNumber(@Param("currentSerial") Long currentSerial);

    @Query("""
        SELECT MIN(nextSerial) FROM (
            SELECT :startSerial + 1 as nextSerial
            UNION
            SELECT MIN(k.serialNumber + 1) 
            FROM KpClient k 
            WHERE k.serialNumber >= :startSerial AND k.serialNumber + 1 NOT IN (
                SELECT k2.serialNumber FROM KpClient k2
            ) AND k.serialNumber + 1 NOT IN (
                SELECT d.serialNumber FROM DeletedSerialNumber d
            ) AND k.serialNumber + 1 NOT IN (
                SELECT r.serialNumber FROM ReservedSerialNumber r
            )
        ) as available_serials
    """)
    Optional<Long> findFirstAvailableSerialNumberAfter(@Param("startSerial") Long startSerial);
}