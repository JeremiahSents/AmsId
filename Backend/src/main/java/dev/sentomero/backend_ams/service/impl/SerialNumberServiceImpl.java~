package dev.sentomero.backend_ams.service.impl;

import dev.sentomero.backend_ams.service.SerialNumberService;

import dev.sentomero.backend_ams.repository.KpClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SerialNumberServiceImpl implements SerialNumberService {
    
    private final KpClientRepository kpClientRepository;
    
    @Autowired
    public SerialNumberServiceImpl(KpClientRepository kpClientRepository) {
        this.kpClientRepository = kpClientRepository;
    }
    
    @Override
    public Long generateSerialNumber() {
        Long maxSerial = kpClientRepository.findMaxSerialNumber().orElse(0L);
        Long newSerialNumber = maxSerial + 1;
        System.out.println("Generated Serial Number: " + newSerialNumber);
        return newSerialNumber;
    }
} 