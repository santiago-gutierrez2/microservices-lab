package com.microlab.order.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "catalog-api", path = "/api")
public interface CatalogClient {
    @GetMapping("/products/{id}")
    ProductResponse getProduct(@PathVariable Long id);
}
