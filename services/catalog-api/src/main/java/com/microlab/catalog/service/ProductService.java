package com.microlab.catalog.service;

import com.microlab.catalog.model.Product;
import com.microlab.catalog.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class ProductService {

    private final ProductRepository repository;

    public ProductService(ProductRepository repository) {
        this.repository = repository;
    }

    public List<Product> findAll() {
        return repository.findAll();
    }

    public Product findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Producto no encontrado: " + id));
    }

    public Product create(Product product) {
        return repository.save(new Product(null, product.name(), product.description(), product.price(), product.stock()));
    }

    public void delete(Long id) {
        if (!repository.deleteById(id)) {
            throw new NoSuchElementException("Producto no encontrado: " + id);
        }
    }
}
