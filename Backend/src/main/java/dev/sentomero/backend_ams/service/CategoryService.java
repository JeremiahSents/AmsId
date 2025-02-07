package dev.sentomero.backend_ams.service;

import dev.sentomero.backend_ams.models.Category;
import dev.sentomero.backend_ams.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class CategoryService implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;


    @Override
    public void run(String... args) throws Exception {
        List<String> categories = Arrays.asList(
                "Sex Worker",
                "Men having Sex with Men",
                "People who inject Drugs",
                "Transgender People",
                "People in Prison and other Closed Settings",
                "People with Disabilities",
                "Adolescents Girls and Young Women",
                "People Living with HIV",
                "Women Pregnant",
                "Miltary and other uninformed services",
                "Client of Sex Workers",
                "Migrant Workers",
                "Long Distance Truck Drivers",
                "Displaced Persons",
                "Non-Injected Drug Users",
                "Fisher Folk",
                "Disordant Couples",
                "Breast Feeding Mothers",
                "Others"
        );

        categories.forEach(category -> {
            if (!categoryRepository.existsByName(category)) {
                Category cat = new Category();
                cat.setName(category);
                categoryRepository.save(cat);
            }
        });
    }
}
