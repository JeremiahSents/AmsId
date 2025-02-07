package dev.sentomero.backend_ams.repository;

import dev.sentomero.backend_ams.models.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Integer> {
    Optional<Category> findByName(String name);
    boolean existsByName(String name);
}
