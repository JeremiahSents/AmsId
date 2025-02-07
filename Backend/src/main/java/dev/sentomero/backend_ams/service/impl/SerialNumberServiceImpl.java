package dev.sentomero.backend_ams.service.impl;

import dev.sentomero.backend_ams.service.SerialNumberService;
import dev.sentomero.backend_ams.repository.KpClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SerialNumberServiceImpl implements SerialNumberService {

    // You can remove KpClientRepository dependency if you are not querying it for MAX anymore
    // private final KpClientRepository kpClientRepository;

    // Keep track of the next serial number to be generated.
    // Start from 5000 (or 05000, treated the same as integer 5000)
    private long nextSerialNumber = 5000L;

    // If you still need KpClientRepository for other reasons, keep the Autowired constructor.
    // Otherwise, you can remove it if SerialNumberServiceImpl only generates serials.
    // @Autowired
    // public SerialNumberServiceImpl(KpClientRepository kpClientRepository) {
    //     this.kpClientRepository = kpClientRepository;
    // }

    public SerialNumberServiceImpl() { // Default constructor if no repository dependency needed
    }


    @Override
    public Long generateSerialNumber() {
        if (nextSerialNumber > 99999) {
            // Handle the case where you've exceeded the 5-digit limit.
            // You might want to:
            // 1. Reset to a starting number (e.g., 5000 or a new base)
            // 2. Throw an exception indicating limit reached
            // 3. Implement a different strategy (e.g., recycle serial numbers)

            System.out.println("Warning: Serial number limit (5 digits) exceeded!");
            // Option 1: Reset to starting number (or a new base if you want to manage ranges)
            nextSerialNumber = 5000L; // Reset to start again - BE CAREFUL with duplicates if reusing!
            // Option 2: Example - Throw exception to signal error condition
            // throw new IllegalStateException("Maximum 5-digit serial number limit reached.");

        }

        Long currentSerialNumber = nextSerialNumber;
        System.out.println("Generated Serial Number: " + currentSerialNumber);
        nextSerialNumber++; // Increment for the next generation
        return currentSerialNumber;
    }
}