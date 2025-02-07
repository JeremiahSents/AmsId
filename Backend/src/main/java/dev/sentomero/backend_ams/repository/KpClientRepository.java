package dev.sentomero.backend_ams.repository;


import dev.sentomero.backend_ams.models.AmsUser;
import dev.sentomero.backend_ams.models.KpClient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface KpClientRepository extends JpaRepository<KpClient, Integer> {


//    @Query("SELECT MAX(k.SerialNumber) FROM KpClient k")
//    Optional<Long> findMaxSerialNumber();


    List<KpClient> findByRegisteredBy_Id(Integer userId);

    List<KpClient> findByRegisteredBy(AmsUser user);

    Optional<KpClient> findBySerialNumber(long serialNumber);
}
