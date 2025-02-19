package dev.sentomero.backend_ams.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


import java.time.LocalDateTime;
@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "deleted_serial_number")
public class DeletedSerialNumber {
    @Id
    private Long serialNumber;

    @Column(nullable = false)
    private LocalDateTime deletedAt;

    @Column(nullable = false)
    private Long originalClientId;  // To maintain reference to original client ID

    @Column(length = 255)
    private String deletionReason;  // Optional: track why it was deleted
}
