package com.microlab.order.client;

import feign.FeignException;
import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

import java.util.NoSuchElementException;

@Component
public class CatalogClientFallBackFactory implements FallbackFactory<CatalogClient> {

    @Override
    public CatalogClient create(Throwable cause) {
        return id -> {
            if (cause instanceof FeignException.NotFound) {
                throw new NoSuchElementException("Producto no encontrado: " + id);
            }
            throw new CatalogUnavailableException("Catalog unavailable, try again later.");
        };
    }
}
