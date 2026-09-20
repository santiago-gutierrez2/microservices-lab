package com.microlab.catalog.config;

import com.microlab.catalog.model.Product;
import com.microlab.catalog.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedProducts(ProductRepository repository) {
        return args -> {
            if (repository.count() > 0) {
                return;
            }
            repository.save(new Product(null, "Teclado mecánico", "Switches rojos, retroiluminado", new BigDecimal("59.99"), 25));
            repository.save(new Product(null, "Monitor 27\" 144Hz", "Panel IPS, 1ms", new BigDecimal("249.00"), 10));
            repository.save(new Product(null, "Mouse inalámbrico", "Sensor óptico 16000 DPI", new BigDecimal("29.50"), 40));
        };
    }
}
