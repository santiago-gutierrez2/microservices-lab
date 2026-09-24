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
├── config-repo/         # Config compartida servida por config-server (backend nativo)
└── services/
    ├── catalog-api/     # Productos — Spring Boot, PostgreSQL (catalog-db, :5433), puerto 8080.
    │                    # Consume order-events de Kafka y descuenta stock (patron Inbox).
    ├── order-service/   # Pedidos — Spring Boot, PostgreSQL (order-db, :5434), puerto 8081.
    │                    # Descubre catalog-api via Eureka (Feign sin URL fija) y publica
    │                    # OrderCreated en Kafka (patron Outbox).
    ├── eureka-server/   # Service registry, dashboard en :8761
    └── config-server/   # Config centralizada, puerto 8888
```

Kafka (KRaft, un solo broker) corre como parte del `docker-compose`, topic `order-events`.

## Cómo correrlo (Fase 3)

Backend completo (bases de datos + `catalog-api` + `order-service`, cada uno en su propio contenedor):

```bash
docker compose up -d --build
```

`catalog-api`: `GET /api/products` (8080). `order-service`: `GET/POST /api/orders` (8081).

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

Corre en `http://localhost:4200` y consume el backend directamente
(CORS habilitado en `catalog-api` para `http://localhost:4200`).
