package dev.sentomero.backend_ams.service.impl;

import dev.sentomero.backend_ams.dto.KpClientDto;
import dev.sentomero.backend_ams.models.AmsUser;
import dev.sentomero.backend_ams.models.Category;
import dev.sentomero.backend_ams.models.KpClient;
import dev.sentomero.backend_ams.repository.AmsUserRepository;
import dev.sentomero.backend_ams.repository.CategoryRepository;
import dev.sentomero.backend_ams.repository.KpClientRepository;
import dev.sentomero.backend_ams.service.KpClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class KpClientServiceImpl implements KpClientService {

    private final KpClientRepository kpClientRepository;
    private final AmsUserRepository amsUserRepository;
    private final CategoryRepository categoryRepository;

    @Autowired
    public KpClientServiceImpl(KpClientRepository kpClientRepository,
                               AmsUserRepository amsUserRepository,
                               CategoryRepository categoryRepository) {
        this.kpClientRepository = kpClientRepository;
        this.amsUserRepository = amsUserRepository;
        this.categoryRepository = categoryRepository;
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
    @Transactional
    public KpClientDto saveClient(KpClientDto clientDto) {
        KpClient client = new KpClient();
        client.setFirstName(clientDto.getKpClientFName());
        client.setLastName(clientDto.getKpClientLName());
        client.setSerialNumber(clientDto.getKpClientSerialNumber());
        
        // Find user by username
        AmsUser registeredBy = amsUserRepository.findByAmsUsername(clientDto.getRegisteredBy())
            .orElseThrow(() -> new RuntimeException("User not found with username: " + clientDto.getRegisteredBy()));
        client.setRegisteredBy(registeredBy);
        
        // Set category if provided
        // Handle Category Logic
        if (clientDto.getCategoryId() != null) {
            // Existing category selected (not 'Other')
            Category category = categoryRepository.findById(clientDto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found with ID: " + clientDto.getCategoryId()));
            client.setCategory(category);
        } else if (clientDto.getNewCategoryName() != null && !clientDto.getNewCategoryName().trim().isEmpty()) {
            // 'Other' category selected, and new category name provided
            String newCategoryName = clientDto.getNewCategoryName().trim();
            Category existingCategory = categoryRepository.findByName(newCategoryName).orElse(null); // Check if category exists

            Category categoryToSet;
            if (existingCategory != null) {
                categoryToSet = existingCategory; // Use existing category
                System.out.println("Using existing category: " + newCategoryName);
            } else {
                // Create new category
                Category newCategory = new Category();
                newCategory.setName(newCategoryName);
                categoryToSet = categoryRepository.save(newCategory); // Save the new category
                System.out.println("Created new category: " + newCategoryName);
            }
            client.setCategory(categoryToSet);
        } else {
            // No category selected and no new category name provided when 'Other' is intended
            // This case should ideally be prevented by frontend validation, but handle it defensively:
            throw new RuntimeException("Category is required.");
        }
        client.setTimeAssigned(LocalDateTime.now());
        
        KpClient savedClient = kpClientRepository.save(client);
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

    @Override
    public void deleteKpClient(int id) {
        KpClient existingClient = kpClientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found with ID: " + id));
        kpClientRepository.delete(existingClient);
    }
}