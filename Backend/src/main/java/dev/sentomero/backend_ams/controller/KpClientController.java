package dev.sentomero.backend_ams.controller;


import dev.sentomero.backend_ams.dto.KpClientDto;
import dev.sentomero.backend_ams.service.KpClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/clients")
public class KpClientController {

    private final KpClientService kpClientService;

    @Autowired
    public KpClientController(KpClientService kpClientService) {
        this.kpClientService = kpClientService;
    }

    @PostMapping("/register")
    public ResponseEntity<KpClientDto> createKpClient(@RequestBody KpClientDto kpClientDto) {
        System.out.println("--- KpClientController - createKpClient method called ---"); // Added log
        System.out.println("KpClientDto received in controller: categoryId = " + kpClientDto.getCategoryId() + ", newCategoryName = " + kpClientDto.getNewCategoryName() + ", firstName = " + kpClientDto.getKpClientFName() + ", lastName = " + kpClientDto.getKpClientLName()); // Added log

        return ResponseEntity.status(HttpStatus.CREATED).body(kpClientService.saveClient(kpClientDto));
    }

    @GetMapping("/all")
    public ResponseEntity<List<KpClientDto>> getAllClients() {
        return ResponseEntity.ok(kpClientService.getAllClients());
    }


    @GetMapping("/{id}")
    public ResponseEntity<KpClientDto> getKpClientById(@PathVariable int id) {
        return ResponseEntity.ok(kpClientService.getKpClientById(id));
    }

    @PutMapping("/updateClient/{id}")
    public ResponseEntity<KpClientDto> updateKpClient(@PathVariable int id, @RequestBody KpClientDto clientDto) {
        KpClientDto updatedClient = kpClientService.updateKpClient(id, clientDto);
        return ResponseEntity.ok(updatedClient);
    }

    @DeleteMapping("/deleteClient/{id}")
    public ResponseEntity<Void> deleteKpClient(@PathVariable int id) {
        kpClientService.deleteKpClient(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/serial/{serialNumber}")
    public ResponseEntity<KpClientDto> getClientBySerialNumber(@PathVariable long serialNumber) {
        return ResponseEntity.ok(kpClientService.getKpClientBySerialNumber(serialNumber));
    }

    @GetMapping("/findClient/serial/{serialNumber}")
    public ResponseEntity<KpClientDto> findClientBySerialNumber(@PathVariable long serialNumber) {
        KpClientDto client = kpClientService.getKpClientBySerialNumber(serialNumber);
        return ResponseEntity.ok(client);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleException(RuntimeException e) {
        Map<String, String> response = new HashMap<>();
        response.put("message", e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
}


