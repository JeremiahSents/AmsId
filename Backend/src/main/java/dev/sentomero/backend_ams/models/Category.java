package dev.sentomero.backend_ams.models;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.Set;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name = "kp_category")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;  // Unique ID for each category

    @Column(name = "name", unique = true, nullable = false)
    private String name;  // Category name (e.g., Breastfeeding)

    @OneToMany(mappedBy = "category")
    private Set<KpClient> clients;
}
