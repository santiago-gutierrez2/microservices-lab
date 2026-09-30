# microservices-lab

Proyecto de aprendizaje para pasar de un monolito a una arquitectura de
microservicios con Spring Boot + Spring Cloud, consumida por un frontend
Angular. Cada fase del roadmap se desarrolla de forma incremental sobre
este mismo repositorio.

## Roadmap

- [x] **Fase 0 — Base**: monolito simple. Un servicio Spring Boot
      (`catalog-api`) con datos en memoria, consumido por una app Angular.
- [x] **Fase 1 — Descomponer en microservicios**: separar en varios
      servicios, cada uno con su propia base de datos PostgreSQL
      (*database per service*), todo orquestado con `docker-compose`.
- [x] **Fase 2 — Comunicación entre servicios**: síncrona (`order-service`
      valida productos contra `catalog-api` vía Feign) y asíncrona
      (Kafka, patrón Outbox en el productor + Inbox idempotente en el
      consumidor).
- [x] **Fase 3 — Descubrimiento y configuración centralizada**: Eureka
      (catalog-api/order-service se descubren por nombre, Feign ya no usa
      URLs fijas) + Spring Cloud Config (backend nativo, config compartida
      en `config-repo/`, con overrides por perfil `docker`).
- [x] **Fase 4 — API Gateway**: Spring Cloud Gateway (variante Server
      MVC, servlet, no reactiva) enruta por nombre de servicio vía Eureka
      (`lb://`); CORS centralizado ahí; el frontend ya solo conoce el
      Gateway.
- [x] **Fase 5 — Resiliencia**: timeout + retry + circuit breaker
      (Resilience4j) en la llamada Feign de `order-service` a
      `catalog-api`; `fallbackFactory` distingue un 404 de negocio de una
      indisponibilidad real.
- [x] **Fase 6 — Observabilidad**: trazabilidad distribuida (Micrometer
      Tracing + Zipkin) para peticiones HTTP/Feign; correlación manual por
      `eventId` (MDC) donde el trace se rompe (Outbox, relay `@Scheduled`,
      consumidor de Kafka).
- [x] **Fase 7 — Seguridad**: OAuth2/JWT validado en el Gateway.
- [x] **Fase 8 — Despliegue**: Docker Compose completo (ya existente) y
      manifiestos de Kubernetes (`k8s/`) para Minikube — Deployments,
      Services, Secrets, PVCs, ConfigMap e Ingress para los 10 componentes.

## Estructura

```
microservices-lab/
├── frontend/            # Angular 22, standalone components + signals. Solo conoce el gateway.
├── config-repo/         # Config compartida servida por config-server (backend nativo)
└── services/
    ├── gateway/         # API Gateway (Spring Cloud Gateway Server MVC), puerto 8082.
    │                    # Unico punto de entrada del frontend; CORS vive aqui.
    ├── catalog-api/     # Productos — Spring Boot, PostgreSQL (catalog-db, :5433), puerto 8080.
    │                    # Consume order-events de Kafka y descuenta stock (patron Inbox).
    ├── order-service/   # Pedidos — Spring Boot, PostgreSQL (order-db, :5434), puerto 8081.
    │                    # Descubre catalog-api via Eureka (Feign sin URL fija) y publica
    │                    # OrderCreated en Kafka (patron Outbox).
    ├── eureka-server/   # Service registry, dashboard en :8761
    └── config-server/   # Config centralizada, puerto 8888
```

Kafka (KRaft, un solo broker) corre como parte del `docker-compose`, topic `order-events`.

## Cómo correrlo (Fase 4)

Backend completo (bases de datos + los 5 servicios, cada uno en su propio contenedor):

```bash
docker compose up -d --build
```

Todo pasa por el gateway: `GET/POST http://localhost:8082/api/products`,
`GET/POST http://localhost:8082/api/orders`. `catalog-api` (8080) y `order-service` (8081) siguen
publicados por comodidad de depuración, pero el frontend y cualquier cliente externo deberían
usar solo el gateway.

Alternativa para desarrollar un servicio suelto sin reconstruir su imagen: levanta solo su base
(`docker compose up -d catalog-db`) y corre el servicio con `./mvnw spring-boot:run` desde
`services/<servicio>` — la config por defecto en `application.yaml` usa el puerto publicado en
el host (`localhost:5433`/`5434`); dentro de Compose se sobreescribe por variables de entorno
(`SPRING_DATASOURCE_*`) apuntando al nombre del contenedor (`catalog-db:5432`).

Frontend:

```bash
cd frontend
npm install
npm start
```

Corre en `http://localhost:4200` y consume el backend a través del gateway
(`http://localhost:8082`); el CORS para `http://localhost:4200` está configurado ahí, no en los
microservicios individuales.
