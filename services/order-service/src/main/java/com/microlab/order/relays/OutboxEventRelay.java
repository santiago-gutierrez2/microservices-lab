package com.microlab.order.relays;


import com.microlab.order.model.OutboxEvent;
import com.microlab.order.repository.OutboxEventRepository;
import com.microlab.order.service.output.OrderCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@Transactional
@RequiredArgsConstructor
public class OutboxEventRelay {
    private final OutboxEventRepository outboxEventRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper  objectMapper;

    @Scheduled(fixedDelay = 5000)
    public void sendOrderEvent() {
        List<OutboxEvent> outboxEvents = outboxEventRepository.getAllNotPublishedByType("OrderCreated");

        for (OutboxEvent outboxEvent : outboxEvents) {
            try {
                // Esperamos la confirmacion del broker antes de marcarlo publicado;
                // si falla o no hay respuesta a tiempo, se reintenta en el siguiente ciclo.
                OrderCreatedEvent orderCreatedEvent = objectMapper.readValue(outboxEvent.getPayload(), OrderCreatedEvent.class);
                MDC.put("eventId", orderCreatedEvent.getEventId().toString());
                kafkaTemplate.send("order-events", outboxEvent.getPayload()).get(5, TimeUnit.SECONDS);
                outboxEvent.setPublishedAt(Instant.now());
                outboxEventRepository.save(outboxEvent);
                log.info("Evento outbox {} (pedido {}) publicado en order-events",
                        outboxEvent.getId(), orderCreatedEvent.getOrderId());
            } catch (Exception e) {
                log.warn("No se pudo publicar el outbox event {}, se reintentara", outboxEvent.getId(), e);
            } finally {
                MDC.clear();
            }
        }
    }
}
