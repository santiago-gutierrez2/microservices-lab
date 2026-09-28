package com.microlab.order.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import zipkin2.reporter.BytesMessageSender;
import zipkin2.reporter.urlconnection.URLConnectionSender;

// El sender por defecto de spring-boot-starter-zipkin usa java.net.http.HttpClient,
// que en esta version choca con un bug de conexion (ClosedChannelException) dentro
// del propio JDK al enviar spans. URLConnectionSender usa HttpURLConnection, mas
// antiguo pero sin ese problema. Definir este bean hace que el @ConditionalOnMissingBean
// del autoconfigurado por defecto se desactive solo.
@Configuration
public class ZipkinSenderConfig {

    @Bean
    public BytesMessageSender zipkinSender(@Value("${management.zipkin.tracing.endpoint}") String endpoint) {
        return URLConnectionSender.create(endpoint);
    }
}
