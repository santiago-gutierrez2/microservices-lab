package com.microlab.order.client;

public class CatalogUnavailableException extends RuntimeException {
    public CatalogUnavailableException(String message) {
        super(message);
    }
}
