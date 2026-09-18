package com.microlab.catalog.repository;

import com.microlab.catalog.model.Product;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Fase 0: almacenamiento en memoria. En la Fase 1 esto se reemplaza
 * por un repositorio JPA respaldado por PostgreSQL (uno por microservicio).
 */
@Repository
public class ProductRepository {

    private final Map<Long, Product> products = new ConcurrentHashMap<>();
    private final AtomicLong sequence = new AtomicLong();

    public ProductRepository() {
        save(new Product(null, "Teclado mecánico", "Switches rojos, retroiluminado", new java.math.BigDecimal("59.99"), 25));
        save(new Product(null, "Monitor 27\" 144Hz", "Panel IPS, 1ms", new java.math.BigDecimal("249.00"), 10));
        save(new Product(null, "Mouse inalámbrico", "Sensor óptico 16000 DPI", new java.math.BigDecimal("29.50"), 40));
    }

    public List<Product> findAll() {
        return List.copyOf(products.values());
    }

    public Optional<Product> findById(Long id) {
        return Optional.ofNullable(products.get(id));
    }

    public Product save(Product product) {
        long id = product.id() != null ? product.id() : sequence.incrementAndGet();
        Product stored = new Product(id, product.name(), product.description(), product.price(), product.stock());
        products.put(id, stored);
        return stored;
    }

    public boolean deleteById(Long id) {
        return products.remove(id) != null;
    }
}
