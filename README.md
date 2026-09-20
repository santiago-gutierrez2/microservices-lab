# microservices-lab

Proyecto de aprendizaje para pasar de un monolito a una arquitectura de
microservicios con Spring Boot + Spring Cloud, consumida por un frontend
Angular. Cada fase del roadmap se desarrolla de forma incremental sobre
este mismo repositorio.

## Roadmap

- [x] **Fase 0 — Base**: monolito simple. Un servicio Spring Boot
      (`catalog-api`) con datos en memoria, consumido por una app Angular.
- [~] **Fase 1 — Descomponer en microservicios**: separar en varios
      servicios, cada uno con su propia base de datos PostgreSQL
      (*database per service*), todo orquestado con `docker-compose`.
- [ ] **Fase 2 — Comunicación entre servicios**: síncrona (OpenFeign /
      WebClient) y asíncrona (Kafka, patrón outbox).
- [ ] **Fase 3 — Descubrimiento y configuración centralizada**: Spring
      Cloud Netflix Eureka (o Consul) + Spring Cloud Config.
- [ ] **Fase 4 — API Gateway**: Spring Cloud Gateway como puerta de
      entrada única para el frontend.
- [ ] **Fase 5 — Resiliencia**: Resilience4j (circuit breaker, retry,
      rate limiter).
- [ ] **Fase 6 — Observabilidad**: trazabilidad distribuida, métricas,
      logs centralizados.
- [ ] **Fase 7 — Seguridad**: OAuth2/JWT validado en el Gateway.
- [ ] **Fase 8 — Despliegue**: Docker Compose completo y migración a
      Kubernetes.

## Estructura

```
microservices-lab/
├── frontend/            # Angular 22, standalone components + signals
└── services/
    ├── catalog-api/     # Productos — Spring Boot, PostgreSQL (catalog-db, :5433), puerto 8080
    └── order-service/   # Pedidos — Spring Boot, PostgreSQL (order-db, :5434), puerto 8081
```

## Cómo correrlo (Fase 1)

Primero las bases de datos (una por servicio):

```bash
docker compose up -d
```


Backend (un terminal por servicio: `catalog-api` en 8080 y `order-service` en 8081):

```bash
cd services/<servicio>
./mvnw spring-boot:run
```

`catalog-api`: `GET /api/products` (8080). `order-service`: `GET/POST /api/orders` (8081).

Frontend:

```bash
cd frontend
npm install
npm start
```

Corre en `http://localhost:4200` y consume el backend directamente
(CORS habilitado en `catalog-api` para `http://localhost:4200`).
