package com.microlab.catalog.model;

import java.math.BigDecimal;

public record Product(Long id, String name, String description, BigDecimal price, int stock) {
}
