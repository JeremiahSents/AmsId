package dev.sentomero.backend_ams.service;

import dev.sentomero.backend_ams.dto.KpClientDto;

import java.util.List;

public interface KpClientService {
    KpClientDto saveClient(KpClientDto client);

    List<KpClientDto> getAllClients();

    KpClientDto getKpClientById(int id);

    KpClientDto getKpClientBySerialNumber(long serialNumber);

    KpClientDto updateKpClient(int id, KpClientDto client);

    void deleteKpClient(int id);

}
