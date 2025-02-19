package dev.sentomero.backend_ams.service.impl;

import dev.sentomero.backend_ams.dto.KpClientDto;
import dev.sentomero.backend_ams.models.AmsUser;
import dev.sentomero.backend_ams.models.Category;
import dev.sentomero.backend_ams.models.DeletedSerialNumber;
import dev.sentomero.backend_ams.models.KpClient;
import dev.sentomero.backend_ams.repository.AmsUserRepository;
import dev.sentomero.backend_ams.repository.CategoryRepository;
import dev.sentomero.backend_ams.repository.DeletedSerialNumberRepository;
import dev.sentomero.backend_ams.repository.KpClientRepository;
import dev.sentomero.backend_ams.service.KpClientService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class KpClientServiceImpl implements KpClientService {

    private static final long STARTING_SERIAL = 5000L;
    private static final long MAX_SERIAL = 99999L;
    private final KpClientRepository kpClientRepository;
    private final AmsUserRepository amsUserRepository;
    private final CategoryRepository categoryRepository;
    private final DeletedSerialNumberRepository deletedSerialNumberRepository;
    private final EntityManager entityManager;

    @Autowired
    public KpClientServiceImpl(KpClientRepository kpClientRepository,
                               AmsUserRepository amsUserRepository,
                               CategoryRepository categoryRepository,
                               DeletedSerialNumberRepository deletedSerialNumberRepository,
                               EntityManager entityManager) {
        this.kpClientRepository = kpClientRepository;
        this.amsUserRepository = amsUserRepository;
        this.categoryRepository = categoryRepository;
        this.deletedSerialNumberRepository = deletedSerialNumberRepository;
        this.entityManager = entityManager;
    }

    private KpClientDto convertToDto(KpClient client) {
        KpClientDto dto = new KpClientDto();
        dto.setKpClientId(client.getId());
        dto.setKpClientFName(client.getFirstName());
        dto.setKpClientLName(client.getLastName());
        dto.setKpClientSerialNumber(client.getSerialNumber());
        dto.setRegisteredBy(client.getRegisteredBy().getAmsUsername());
        
        System.out.println("Converting client ID: " + client.getId());
        if (client.getCategory() != null) {
            System.out.println("Category found: " + client.getCategory().getName());
            dto.setCategoryId(client.getCategory().getId());
        } else {
            System.out.println("No category found for client");
            dto.setCategoryId(null);
        }
        
        dto.setKpClientTimeAssigned(client.getTimeAssigned());
        return dto;
    }

    @Override
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public KpClientDto saveClient(KpClientDto clientDto) {
        // Acquire pessimistic lock at the beginning of the transaction
     entityManager.createNativeQuery("SELECT pg_advisory_xact_lock(123456)").getSingleResult();

        // Generate Serial Number - Logic moved from SerialNumberServiceImpl

        Optional<Long> maxCurrentSerial = kpClientRepository.findHighestSerialNumber();
        Optional<Long> maxDeletedSerial = Optional.ofNullable(
                deletedSerialNumberRepository.findAllDeletedSerials()
                        .stream()
                        .max(Long::compareTo)
                        .orElse(null)
        );

        long highestSerial = Stream.of(maxCurrentSerial, maxDeletedSerial)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .max(Long::compareTo)
                .orElse(STARTING_SERIAL - 1);

        long nextSerial = highestSerial + 1;

        if (nextSerial > MAX_SERIAL) {
            throw new IllegalStateException("No available serial numbers in the valid range");
        }

        KpClient kpClient = new KpClient();
        kpClient.setFirstName(clientDto.getKpClientFName());
        kpClient.setLastName(clientDto.getKpClientLName());
        kpClient.setSerialNumber(nextSerial);
        kpClient.setTimeAssigned(LocalDateTime.now());
        kpClient.setRegisteredBy(amsUserRepository.findByAmsUsername(clientDto.getRegisteredBy())
                .orElseThrow(() -> new RuntimeException("User not found: " + clientDto.getRegisteredBy())));
        kpClient.setCategory(categoryRepository.findById(clientDto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found: " + clientDto.getCategoryId())));

        KpClient savedClient = kpClientRepository.save(kpClient);
        return convertToDto(savedClient);
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
        if (clientDto.getCategoryId() != null ) { // Only handle existing categories for update for simplicity in this example. Extend logic if needed to handle 'Other' for update.
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
        deletedSerial.setOriginalClientId((long) client.getId()); // Add this line to set originalClientId
        deletedSerialNumberRepository.save(deletedSerial);

        // Now delete the client
        kpClientRepository.delete(client);
    }

    @Override
    @Transactional(isolation = Isolation.SERIALIZABLE, readOnly = true) // Read-only transaction for form fetch
    public Long generateSerialNumberForForm() {
        // Create a pessimistic lock (shared lock)
        entityManager.createNativeQuery("SELECT pg_advisory_xact_lock_shared(123456)").getSingleResult();

        // Get both current and deleted serial numbers (same logic)
        Optional<Long> maxCurrentSerial = kpClientRepository.findHighestSerialNumber();
        Optional<Long> maxDeletedSerial = Optional.ofNullable(
                deletedSerialNumberRepository.findAllDeletedSerials()
                        .stream()
                        .max(Long::compareTo)
                        .orElse(null)
        );

        long highestSerial = Stream.of(maxCurrentSerial, maxDeletedSerial)
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
    }
