package com.microlab.catalog.messaging;

import lombok.Data;

import java.util.UUID;

@Data
public class OrderCreatedEvent {
    private UUID eventId;
    private Long orderId;
    private Long productId;
    private Integer quantity;
}
