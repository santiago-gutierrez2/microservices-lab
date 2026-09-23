package com.microlab.order.repository;

import com.microlab.order.model.OutboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OutboxEventRepository extends JpaRepository<OutboxEvent,Long> {
    @Query("select o from OutboxEvent o where o.publishedAt is null and o.eventType = :eventType")
    List<OutboxEvent> getAllNotPublishedByType(String eventType);
}
