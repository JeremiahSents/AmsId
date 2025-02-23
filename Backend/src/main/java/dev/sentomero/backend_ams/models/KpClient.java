package dev.sentomero.backend_ams.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
@Table(name = "kp_client")
public class KpClient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "serial_number", unique = true, nullable = false)
    private long serialNumber;

    @Column(name = "date_assigned")
    private LocalDateTime timeAssigned;

    @ManyToOne
    @JoinColumn(name = "registered_by", nullable = false)
    private AmsUser registeredBy;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "kp_category", nullable = false) // Ensure this matches the DB column
    private Category category;
    @PrePersist
    protected void onCreate() {
        this.timeAssigned = LocalDateTime.now();
    }
}
