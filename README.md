# microservices-lab

Proyecto de aprendizaje para pasar de un monolito a una arquitectura de
microservicios con Spring Boot + Spring Cloud, consumida por un frontend
Angular. Cada fase del roadmap se desarrolla de forma incremental sobre
este mismo repositorio.

## Roadmap

- [x] **Fase 0 — Base**: monolito simple. Un servicio Spring Boot
      (`catalog-api`) con datos en memoria, consumido por una app Angular.
- [ ] **Fase 1 — Descomponer en microservicios**: separar en varios
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
    └── catalog-api/     # Spring Boot 3, Java 17 — Fase 0: datos en memoria
```

## Cómo correrlo (Fase 0)

Backend:

```bash
cd services/catalog-api
./mvnw spring-boot:run
```

Corre en `http://localhost:8080`, endpoint principal `GET /api/products`.

Frontend:

```bash
cd frontend
npm install
npm start
```

Corre en `http://localhost:4200` y consume el backend directamente
(CORS habilitado en `catalog-api` para `http://localhost:4200`).
