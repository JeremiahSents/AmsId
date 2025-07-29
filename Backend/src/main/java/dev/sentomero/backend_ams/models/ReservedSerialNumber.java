package dev.sentomero.backend_ams.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "reserved_serial_number")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservedSerialNumber {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "serial_number", nullable = false, unique = true)
    private Long serialNumber;

    @Column(name = "reserved_at", nullable = false)
    private LocalDateTime reservedAt;

    @Column(name = "reservation_token", nullable = false)
    private String reservationToken;
}