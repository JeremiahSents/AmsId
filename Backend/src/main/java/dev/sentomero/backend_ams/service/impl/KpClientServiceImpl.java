package dev.sentomero.backend_ams.service.impl;

import dev.sentomero.backend_ams.dto.KpClientDto;
import dev.sentomero.backend_ams.models.Category;
import dev.sentomero.backend_ams.models.DeletedSerialNumber;
import dev.sentomero.backend_ams.models.KpClient;
import dev.sentomero.backend_ams.models.ReservedSerialNumber; // New entity to add
import dev.sentomero.backend_ams.repository.AmsUserRepository;
import dev.sentomero.backend_ams.repository.CategoryRepository;
import dev.sentomero.backend_ams.repository.DeletedSerialNumberRepository;
import dev.sentomero.backend_ams.repository.KpClientRepository;
import dev.sentomero.backend_ams.repository.ReservedSerialNumberRepository; // New repository to add
import dev.sentomero.backend_ams.service.KpClientService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class KpClientServiceImpl implements KpClientService {

    private static final long STARTING_SERIAL = 5000L;
    private static final long MAX_SERIAL = 99999L;
    private final KpClientRepository kpClientRepository;
    private final AmsUserRepository amsUserRepository;
    private final CategoryRepository categoryRepository;
    private final DeletedSerialNumberRepository deletedSerialNumberRepository;
    private final ReservedSerialNumberRepository reservedSerialNumberRepository; // New repository
    private final EntityManager entityManager;

    private KpClientDto convertToDto(KpClient client) {
        KpClientDto dto = new KpClientDto();
        dto.setKpClientId(client.getId());
        dto.setKpClientFName(client.getFirstName());
        dto.setKpClientLName(client.getLastName());
        dto.setKpClientSerialNumber(client.getSerialNumber());
        dto.setRegisteredBy(client.getRegisteredBy().getAmsUsername());
        dto.setKpClientTimeAssigned(client.getTimeAssigned());
        return dto;
    }

    @Override
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public KpClientDto saveClient(KpClientDto clientDto) {
        // Acquire pessimistic lock at the beginning of the transaction
        entityManager.createNativeQuery("SELECT pg_advisory_xact_lock(123456)").getSingleResult();

        // Use the serial number from the DTO if provided, otherwise generate a new one
        long serialNumber;
        if (clientDto.getKpClientSerialNumber() != null && clientDto.getKpClientSerialNumber() > 0) {
            serialNumber = clientDto.getKpClientSerialNumber();

            // Check if this serial was reserved and release the reservation
            reservedSerialNumberRepository.findBySerialNumber(serialNumber)
                    .ifPresent(reservation -> reservedSerialNumberRepository.delete(reservation));

            // Verify the serial number is still available
            if (kpClientRepository.isSerialNumberTaken(serialNumber)) {
                throw new IllegalStateException("Serial number " + serialNumber + " is no longer available");
            }
        } else {
            // Generate a new serial number if none was provided
            serialNumber = getNextAvailableSerialNumber();
        }

        KpClient kpClient = new KpClient();
        kpClient.setFirstName(clientDto.getKpClientFName());
        kpClient.setLastName(clientDto.getKpClientLName());
        kpClient.setSerialNumber(serialNumber);
        kpClient.setTimeAssigned(LocalDateTime.now());
        kpClient.setRegisteredBy(amsUserRepository.findByAmsUsername(clientDto.getRegisteredBy())
                .orElseThrow(() -> new RuntimeException("User not found: " + clientDto.getRegisteredBy())));
        kpClient.setCategory(categoryRepository.findById(clientDto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found: " + clientDto.getCategoryId())));

        KpClient savedClient = kpClientRepository.save(kpClient);
        return convertToDto(savedClient);
    }

    /**
     * Gets the next available serial number considering existing clients, deleted serials,
     * and currently reserved serials.
     */
    private long getNextAvailableSerialNumber() {
        Optional<Long> maxCurrentSerial = kpClientRepository.findHighestSerialNumber();

        // Check deleted serials
        Optional<Long> maxDeletedSerial = Optional.ofNullable(
                deletedSerialNumberRepository.findAllDeletedSerials()
                        .stream()
                        .max(Long::compareTo)
                        .orElse(null)
        );

        // Check reserved serials
        Optional<Long> maxReservedSerial = Optional.ofNullable(
                reservedSerialNumberRepository.findAllReservedSerials()
                        .stream()
                        .max(Long::compareTo)
                        .orElse(null)
        );

        long highestSerial = Stream.of(maxCurrentSerial, maxDeletedSerial, maxReservedSerial)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .max(Long::compareTo)
                .orElse(STARTING_SERIAL - 1);

        long nextSerial = highestSerial + 1;

        if (nextSerial > MAX_SERIAL) {
            throw new IllegalStateException("No available serial numbers in the valid range");
        }

        return nextSerial;
    }

    @Override
    public List<KpClientDto> getAllClients() {
        return kpClientRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public KpClientDto getKpClientById(int id) {
        KpClient kpClient = kpClientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found with ID: " + id));
        return convertToDto(kpClient);
    }

    @Override
    public KpClientDto getKpClientBySerialNumber(long serialNumber) {
        return convertToDto(kpClientRepository.findBySerialNumber(serialNumber)
                .orElseThrow(() -> new RuntimeException("Client not found with serial number: " + serialNumber)));
    }

    @Override
    public KpClientDto updateKpClient(int id, KpClientDto clientDto) {
        KpClient existingClient = kpClientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found with ID: " + id));

        existingClient.setFirstName(clientDto.getKpClientFName());
        existingClient.setLastName(clientDto.getKpClientLName());

        // Update category if provided
        if (clientDto.getCategoryId() != null) {
            Category category = categoryRepository.findById(clientDto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found: " + clientDto.getCategoryId()));
            existingClient.setCategory(category);
        }

        return convertToDto(kpClientRepository.save(existingClient));
    }

    @Transactional
    @Override
    public void deleteKpClient(int id) {
        KpClient client = kpClientRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Client not found"));

        // Save the serial number to deleted table before deleting the client
        DeletedSerialNumber deletedSerial = new DeletedSerialNumber();
        deletedSerial.setSerialNumber(client.getSerialNumber());
        deletedSerial.setDeletedAt(LocalDateTime.now());
        deletedSerial.setOriginalClientId((long) client.getId());
        deletedSerialNumberRepository.save(deletedSerial);

        // Now delete the client
        kpClientRepository.delete(client);
    }

    @Override
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public Long generateSerialNumberForForm() {
        entityManager.createNativeQuery("SELECT pg_advisory_xact_lock(123456)").getSingleResult();

        // Find an already reserved but unused serial number
        Optional<Long> alreadyReservedSerial = reservedSerialNumberRepository.findAllReservedSerials()
                .stream()
                .min(Long::compareTo);

        if (alreadyReservedSerial.isPresent()) {
            System.out.println("Reusing reserved serial: " + alreadyReservedSerial.get());
            return alreadyReservedSerial.get();
        }

        // Get a new serial number if none is reserved
        long nextSerial = getNextAvailableSerialNumber();
        System.out.println("Generated new serial number: " + nextSerial);

        ReservedSerialNumber reservation = new ReservedSerialNumber();
        reservation.setSerialNumber(nextSerial);
        reservation.setReservedAt(LocalDateTime.now());
        reservation.setReservationToken(UUID.randomUUID().toString());
        reservedSerialNumberRepository.save(reservation);

        return nextSerial;
    }

}