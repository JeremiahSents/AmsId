package dev.sentomero.backend_ams.controller;

import dev.sentomero.backend_ams.dto.CategoryDto;
import dev.sentomero.backend_ams.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;
@RestController
@RequestMapping("/api")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    @Autowired
    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDto>> getCategories() {
        List<CategoryDto> categories = categoryRepository.findAll()
                .stream()
                .map(category -> new CategoryDto(category.getId(), category.getName()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(categories);
    }
}
