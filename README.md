# Recruitment Microservices Platform

Online recruitment platform built with Spring Boot microservices, Spring Cloud, PostgreSQL, RabbitMQ, and a React + Vite frontend.

## Architecture
```text
┌───────────────┐      ┌───────────────────┐      ┌────────────────────┐
│ frontend-app  │─────▶│    api-gateway    │─────▶│ discovery-service  │
└───────────────┘      └───────────────────┘      └────────────────────┘
         │                        │                         ▲
         │                        ▼                         │
         │               ┌───────────────────┐             │
         └──────────────▶│    config-server  │─────────────┘
                         └───────────────────┘
                                  │
     ┌───────────────┬────────────┼─────────────┬───────────────┬─────────────────┐
     ▼               ▼            ▼             ▼               ▼                 ▼
┌───────────┐  ┌───────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│user-serv. │  │job-serv.  │ │application-  │ │notification- │ │reporting-    │ │ PostgreSQL   │
│JWT + JPA  │  │JPA + search│ │service + MQ │ │service + mail│ │service + REST│ │ per service  │
└───────────┘  └───────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
                                      │
                                      ▼
                                ┌───────────┐
                                │ RabbitMQ  │
                                └───────────┘
```

## Services
- `config-server` on `8888`: centralized configuration source.
- `discovery-service` on `8761`: Eureka registry.
- `api-gateway` on `8080`: route entrypoint + JWT validation + user header propagation.
- `user-service` on `8081`: registration, login, JWT issuing, JWKS, profile management, CV upload.
- `job-service` on `8082`: employer-owned job CRUD + search + application counters.
- `application-service` on `8083`: apply, review workflow, duplicate protection, RabbitMQ events.
- `notification-service` on `8084`: event listeners + HTML email templates.
- `reporting-service` on `8085`: admin/employer analytics via REST aggregation.
- `frontend-app` on `80` in Docker or `5173` in dev.

## Environment Variables
- `MAIL_USERNAME`: SMTP username used by `notification-service`.
- `MAIL_PASSWORD`: SMTP password used by `notification-service`.
- `VITE_API_BASE_URL`: frontend API base URL in development. Defaults to `http://localhost:8080`.
- `CONFIG_SERVER_URL`: set by Docker Compose for every Spring client.
- `EUREKA_DEFAULT_ZONE`: set by Docker Compose for every Eureka client.
- `USER_SERVICE_JWKS_URI`: set for the gateway and resource servers when needed.
- `CV_STORAGE_DIR`: storage path for uploaded CVs inside `user-service`.

## Startup Order
1. `config-server`
2. `discovery-service`
3. Business services:
   `user-service`, `job-service`, `application-service`, `notification-service`, `reporting-service`
4. `api-gateway`
5. `frontend-app`

Docker Compose uses healthchecks plus `depends_on` with `service_healthy` to enforce that order.

## Local Development
### Backend
Run each Maven module from its nested project directory:

```powershell
cd .\config-server\config-server
.\mvnw.cmd spring-boot:run
```

Repeat for the other services after `config-server` and `discovery-service` are up.

### Frontend
```powershell
cd .\frontend-app
npm.cmd install
npm.cmd run dev
```

## Docker Compose
Build and start everything:

```powershell
docker compose up --build
```

Important URLs:
- Frontend: `http://localhost`
- Gateway: `http://localhost:8080`
- Eureka: `http://localhost:8761`
- RabbitMQ management: `http://localhost:15672`

## Key API Endpoints
### User Service
- `POST /api/users/register`
- `POST /api/users/login`
- `GET /api/users/me`
- `PUT /api/users/{id}`
- `POST /api/users/{id}/cv`
- `GET /api/users/.well-known/jwks.json`

### Job Service
- `POST /api/jobs`
- `GET /api/jobs`
- `GET /api/jobs/search`
- `GET /api/jobs/{id}`
- `PATCH /api/jobs/{id}/status`

### Application Service
- `POST /api/applications`
- `GET /api/applications/candidate/{candidateId}`
- `GET /api/applications/job/{jobId}`
- `PATCH /api/applications/{id}/status`
- `DELETE /api/applications/{id}`

### Reporting Service
- `GET /api/reports/overview`
- `GET /api/reports/jobs`
- `GET /api/reports/applications`
- `GET /api/reports/employer/{id}`

## Notes
- Configuration is centralized in `config-server/src/main/resources/config-repo/`.
- JWTs are signed in `user-service` and exposed through the JWKS endpoint for gateway/resource-server validation.
- Notification emails render even without SMTP credentials; in that case the service logs the HTML instead of sending.
- Uploaded CVs are stored under the configured `CV_STORAGE_DIR` and mounted to a named Docker volume in Compose.
