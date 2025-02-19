package dev.sentomero.backend_ams.models;


import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "reserved_serial_numbers")
public class ReservedSerialNumber {
    @Id
    private Long serialNumber;
    private LocalDateTime reservedAt;
}
