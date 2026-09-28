package com.microlab.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import zipkin2.reporter.BytesMessageSender;
import zipkin2.reporter.urlconnection.URLConnectionSender;

// Ver el mismo bean en catalog-api/order-service: evita un bug de
// ClosedChannelException del sender por defecto basado en java.net.http.HttpClient.
@Configuration
public class ZipkinSenderConfig {

    @Bean
    public BytesMessageSender zipkinSender(@Value("${management.zipkin.tracing.endpoint}") String endpoint) {
        return URLConnectionSender.create(endpoint);
    }
}
