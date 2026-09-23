package com.microlab.order.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

// Tabla independiente, sin relacion JPA con Order: el outbox es infraestructura
// de mensajeria, no una coleccion del agregado de negocio.
@Entity
@Table(name = "outbox_event")
@Getter
@Setter
public class OutboxEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String eventType;
    @Column(columnDefinition = "text")
    private String payload;
    @CreationTimestamp
    private Instant createdAt;
    private Instant publishedAt;
}
