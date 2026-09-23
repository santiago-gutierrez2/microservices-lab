package com.microlab.order.service.output;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class OrderCreatedEvent {
    Long orderId;
    Long productId;
    Integer quantity;
}
