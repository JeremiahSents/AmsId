package dev.sentomero.backend_ams.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name = "audit_log")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String action; // Example: "REGISTERED_CLIENT"

    @Column(nullable = false)
    private String performedBy; // Stores the username or ID of the health worker

    @Column(nullable = false)
    private LocalDateTime timestamp; // Stores when the action happened
}
