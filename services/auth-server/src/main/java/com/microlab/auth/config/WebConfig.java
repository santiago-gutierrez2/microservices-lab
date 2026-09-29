package com.microlab.auth.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

// Angular llama a /oauth2/token directamente desde el navegador (fetch/XHR).
// Un WebMvcConfigurer normal (como en catalog-api/order-service) no basta
// aqui: Spring Security intercepta la peticion ANTES de que llegue a la capa
// de Spring MVC donde ese CORS se aplicaria, y para una peticion anonima
// (el preflight OPTIONS) responde con un redirect a /login en vez de dejarla
// pasar - el navegador nunca ve cabeceras CORS y aborta antes de intentar
// el POST real. Un CorsFilter registrado con prioridad maxima se ejecuta
// ANTES que el filtro de Spring Security, así que resuelve el preflight
// el mismo y añade la cabecera Access-Control-Allow-Origin a la respuesta
// real, sin tocar la cadena de seguridad autoconfigurada.
@Configuration
public class WebConfig {

    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:4200"));
        config.setAllowedMethods(List.of("GET", "POST", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(source));
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return bean;
    }
}
