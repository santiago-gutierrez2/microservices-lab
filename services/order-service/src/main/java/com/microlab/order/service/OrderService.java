package com.microlab.order.service;

import com.microlab.order.client.CatalogClient;
import com.microlab.order.client.ProductResponse;
import com.microlab.order.model.Order;
import com.microlab.order.model.OutboxEvent;
import com.microlab.order.repository.OrderRepository;
import com.microlab.order.repository.OutboxEventRepository;
import com.microlab.order.service.input.OrderRequest;
import com.microlab.order.service.output.OrderCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository repository;
    private final OutboxEventRepository outboxEventRepository;
    private final CatalogClient catalogClient;
    private final ObjectMapper objectMapper;


    public List<Order> findAll() {
        return repository.findAll();
    }

    public Order findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Pedido no encontrado: " + id));
    }

    public Order create(OrderRequest request) {
        ProductResponse productResponse;

        productResponse = catalogClient.getProduct(request.productId());

        Order order = new Order();
        order.setProductId(request.productId());
        order.setQuantity(request.quantity());
        order.setUnitPrice(productResponse.getPrice());

        // Guardamos primero: con GenerationType.IDENTITY, el id solo existe tras el INSERT.
        Order created = repository.save(order);

        OutboxEvent outboxEvent = new OutboxEvent();
        outboxEvent.setEventType("OrderCreated");
        UUID eventId = UUID.randomUUID();
        try {
            MDC.put("eventId", eventId.toString());
            log.info("Pedido {} creado (producto {}, cantidad {}); generando evento OrderCreated",
                    created.getId(), created.getProductId(), created.getQuantity());
            outboxEvent.setPayload(objectMapper.writeValueAsString(
                    new OrderCreatedEvent(eventId, created.getId(), created.getProductId(), created.getQuantity())));
            // Misma transaccion que el save de arriba: o se guardan las dos filas, o ninguna.
            outboxEventRepository.save(outboxEvent);

            return created;
        } finally {
            MDC.clear();
        }
    }
}
