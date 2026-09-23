package com.microlab.order.service.output;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class OrderCreatedEvent {
    UUID eventId;
    Long orderId;
    Long productId;
    Integer quantity;
}
