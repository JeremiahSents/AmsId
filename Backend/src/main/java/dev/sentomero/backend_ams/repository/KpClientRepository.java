package dev.sentomero.backend_ams.repository;


import dev.sentomero.backend_ams.models.AmsUser;
import dev.sentomero.backend_ams.models.KpClient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.List;

public interface KpClientRepository extends JpaRepository<KpClient, Integer> {


    @Query("SELECT MAX(c.serialNumber) FROM KpClient c")
    Optional<Long> findHighestSerialNumber();

    @Query("SELECT c.serialNumber FROM KpClient c ORDER BY c.serialNumber")
    List<Long> findAllSerialNumbersOrdered();

    boolean existsBySerialNumber(Long serialNumber);


    List<KpClient> findByRegisteredBy_Id(Integer userId);

    List<KpClient> findByRegisteredBy(AmsUser user);

    Optional<KpClient> findBySerialNumber(long serialNumber);
}
