package com.microlab.catalog.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Fase 0/1: el frontend Angular llama directo a este servicio, por eso
 * habilitamos CORS aquí. A partir de la Fase 4 (API Gateway) esto se
 * centraliza en el Gateway y el frontend deja de hablar con los
 * microservicios directamente.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:4200")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS");
    }
}
