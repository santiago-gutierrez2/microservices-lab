package com.microlab.catalog.messaging;

import com.microlab.catalog.model.ProcessedEvent;
import com.microlab.catalog.model.Product;
import com.microlab.catalog.repository.ProcessedEventRepository;
import com.microlab.catalog.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

@Component
@Transactional
@RequiredArgsConstructor
@Slf4j
public class KafkaConsumers {
    private final ProcessedEventRepository processedEventRepository;
    private final ProductRepository productRepository;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "order-events", groupId = "${spring.kafka.consumer.group-id}")
    public void onOrderCreated(String payload) {
        OrderCreatedEvent event = objectMapper.readValue(payload, OrderCreatedEvent.class);

        if (processedEventRepository.existsById(event.getEventId())) {
            return;
        }

        Product product = productRepository.findById(event.getProductId()).orElse(null);
        if (product == null) {
            log.warn("No product found with id {}", event.getProductId());
            return;
        }

        product.setStock(product.getStock() - event.getQuantity());
        productRepository.save(product);

        ProcessedEvent  processedEvent = new ProcessedEvent();
        processedEvent.setEventType("order-event");
        processedEvent.setEventId(event.getEventId());
        processedEvent.setProductId(event.getProductId());
        processedEvent.setOrderId(event.getOrderId());
        processedEventRepository.save(processedEvent);
    }
}
