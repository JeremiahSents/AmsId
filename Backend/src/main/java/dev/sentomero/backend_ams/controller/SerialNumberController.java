package dev.sentomero.backend_ams.controller;

import dev.sentomero.backend_ams.service.SerialNumberService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/serial")
public class SerialNumberController {
    
    private final SerialNumberService serialNumberService;
    
    @Autowired
    public SerialNumberController(SerialNumberService serialNumberService) {
        this.serialNumberService = serialNumberService;
    }

    @GetMapping("/generate")
    public ResponseEntity<Long> generateSerialNumber() {
        Long serialNumber = serialNumberService.generateSerialNumber();
        return ResponseEntity.ok(serialNumber);
    }
} 