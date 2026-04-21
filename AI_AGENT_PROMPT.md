# 🤖 AI AGENT PROMPT — Recruitment Microservices Application

## CONTEXT

You are an expert Java/Spring Boot developer. Your task is to build a complete **Online Recruitment Application** using a **microservices architecture**. The project is already initialized with Spring Initializr. You must implement all services from scratch with production-quality code.

---

## PROJECT STRUCTURE

The workspace root contains these pre-initialized Maven projects:

```
recruitment-platform/
├── config-server/         # ⭐ Spring Cloud Config Server (start FIRST)
├── discovery-service/     # ⭐ Eureka Server (start SECOND)
├── api-gateway/           # Spring Cloud Gateway
├── user-service/          # User management + JWT auth
├── job-service/           # Job offer management
├── application-service/   # Job applications management
├── notification-service/  # Email notifications via RabbitMQ
├── reporting-service/     # Analytics & reporting
├── frontend-app/          # ⭐ React + Vite + TypeScript (port 5173 / 80)
├── config-repo/           # Git repo with all application.yml configs
└── docker-compose.yml     # Full infrastructure
```

---

## GLOBAL TECHNICAL STACK

- **Java 21**, Spring Boot 3.3.x, **Spring Cloud 2023.x**
- **PostgreSQL** (one database per service — database-per-service pattern)
- **RabbitMQ** for async messaging between services
- **JWT (RS256)** for authentication (issued by user-service, validated by all others)
- **Spring Cloud Gateway** as single entry point
- **Eureka Server** for service discovery (all services register themselves)
- **Spring Cloud Config Server** for centralized configuration (backed by local Git repo)
- **React 18 + Vite + TypeScript** for the frontend SPA
- **Docker + Docker Compose** for all infrastructure
- **Lombok** for boilerplate reduction
- **MapStruct** for DTO mapping (add dependency manually)
- **Flyway** for database migrations (add dependency manually)

---

## SERVICE 0a: `config-server` (port 8888)

### Purpose
Centralized configuration server. **Must start before all other services.**
All microservices fetch their `application.yml` from this server on startup.

### Main Class
```java
@SpringBootApplication
@EnableConfigServer
public class ConfigServerApplication { ... }
```

### application.yml
```yaml
server:
  port: 8888

spring:
  application:
    name: config-server
  cloud:
    config:
      server:
        native:
          search-locations: classpath:/config-repo
          # In production, use git backend:
          # git:
          #   uri: https://github.com/your-org/recruitment-config
  profiles:
    active: native

eureka:
  client:
    service-url:
      defaultZone: http://discovery-service:8761/eureka/
  instance:
    prefer-ip-address: true
```

### Config Files to create in `src/main/resources/config-repo/`

Create one `.yml` file per service. Each file is served at `http://config-server:8888/{service-name}/default`.

**`user-service.yml`**
```yaml
server:
  port: 8081
spring:
  datasource:
    url: jdbc:postgresql://postgres-users:5432/users_db
    username: recruit
    password: recruit123
  jpa:
    hibernate:
      ddl-auto: validate
  flyway:
    enabled: true
jwt:
  private-key-path: classpath:keys/private.pem
  public-key-path: classpath:keys/public.pem
  expiration: 86400000
```

**`job-service.yml`**
```yaml
server:
  port: 8082
spring:
  datasource:
    url: jdbc:postgresql://postgres-jobs:5432/jobs_db
    username: recruit
    password: recruit123
services:
  user-service-url: http://user-service:8081
```

**`application-service.yml`**
```yaml
server:
  port: 8083
spring:
  datasource:
    url: jdbc:postgresql://postgres-applications:5432/applications_db
    username: recruit
    password: recruit123
  rabbitmq:
    host: rabbitmq
    port: 5672
    username: recruit
    password: recruit123
services:
  job-service-url: http://job-service:8082
  user-service-url: http://user-service:8081
```

**`notification-service.yml`**
```yaml
server:
  port: 8084
spring:
  rabbitmq:
    host: rabbitmq
    port: 5672
    username: recruit
    password: recruit123
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${MAIL_USERNAME}
    password: ${MAIL_PASSWORD}
    properties:
      mail.smtp.auth: true
      mail.smtp.starttls.enable: true
```

**`reporting-service.yml`**
```yaml
server:
  port: 8085
spring:
  datasource:
    url: jdbc:postgresql://postgres-reporting:5432/reporting_db
    username: recruit
    password: recruit123
services:
  user-service-url: http://user-service:8081
  job-service-url: http://job-service:8082
  application-service-url: http://application-service:8083
```

**`api-gateway.yml`**
```yaml
server:
  port: 8080
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://user-service
          predicates: [Path=/api/users/**]
        - id: job-service
          uri: lb://job-service
          predicates: [Path=/api/jobs/**]
        - id: application-service
          uri: lb://application-service
          predicates: [Path=/api/applications/**]
        - id: notification-service
          uri: lb://notification-service
          predicates: [Path=/api/notifications/**]
        - id: reporting-service
          uri: lb://reporting-service
          predicates: [Path=/api/reports/**]
      globalcors:
        corsConfigurations:
          '[/**]':
            allowedOrigins: "*"
            allowedMethods: "*"
            allowedHeaders: "*"
```

> **Note:** Routes use `lb://` prefix — Spring Cloud Gateway resolves service URLs through Eureka.

---

## SERVICE 0b: `discovery-service` (port 8761)

### Purpose
Eureka Service Registry. **Must start after config-server, before all business services.**
All microservices register here. Gateway uses it to resolve `lb://service-name` URIs.

### Main Class
```java
@SpringBootApplication
@EnableEurekaServer
public class DiscoveryServiceApplication { ... }
```

### application.yml
```yaml
server:
  port: 8761

spring:
  application:
    name: discovery-service
  config:
    import: "optional:configserver:http://config-server:8888"

eureka:
  instance:
    hostname: discovery-service
  client:
    register-with-eureka: false   # Eureka server does not register itself
    fetch-registry: false
  server:
    wait-time-in-ms-when-sync-empty: 0
    enable-self-preservation: false  # Disable in dev
```

### Eureka Dashboard
Accessible at: `http://localhost:8761` — shows all registered services with their status (UP/DOWN).

---

## EUREKA CLIENT CONFIG (add to ALL other services)

Every business service (`user-service`, `job-service`, etc.) must have this in its `bootstrap.yml`:

```yaml
# src/main/resources/bootstrap.yml  (in each service)
spring:
  application:
    name: user-service   # change per service
  config:
    import: "optional:configserver:http://config-server:8888"

eureka:
  client:
    service-url:
      defaultZone: http://discovery-service:8761/eureka/
    fetch-registry: true
    register-with-eureka: true
  instance:
    prefer-ip-address: true
    lease-renewal-interval-in-seconds: 10
    lease-expiration-duration-in-seconds: 30
```

Also add `spring-cloud-starter-netflix-eureka-client` and `spring-cloud-starter-config` dependencies to **all** business service `pom.xml` files.

---

## SERVICE 1: `user-service` (port 8081)

### Entities
```java
// User.java
- Long id
- String email (unique)
- String passwordHash
- String firstName, lastName
- Role role  // enum: CANDIDATE, EMPLOYER, ADMIN
- LocalDateTime createdAt

// CandidateProfile.java (OneToOne with User where role=CANDIDATE)
- Long id
- User user
- String phone
- String address
- String summary (bio)
- String cvUrl (file path or URL)
- List<String> skills

// EmployerProfile.java (OneToOne with User where role=EMPLOYER)
- Long id
- User user
- String companyName
- String companyDescription
- String website
- String industry
```

### REST Endpoints
```
POST   /api/users/register       → Register (CANDIDATE or EMPLOYER)
POST   /api/users/login          → Login → returns JWT access token
GET    /api/users/{id}           → Get user profile
PUT    /api/users/{id}           → Update profile (authenticated)
POST   /api/users/{id}/cv        → Upload CV (multipart, CANDIDATE only)
GET    /api/users/{id}/cv        → Download CV
DELETE /api/users/{id}           → Delete account (ADMIN or self)
```

### Security
- Passwords hashed with **BCrypt**
- JWT signed with **RSA private key**, verified with public key
- Token contains: userId, email, role, expiration (24h)
- Expose public key at: `GET /api/users/.well-known/jwks.json`

### DTOs
- `RegisterRequest` { email, password, firstName, lastName, role, companyName? }
- `LoginRequest` { email, password }
- `LoginResponse` { accessToken, tokenType, expiresIn, userId, role }
- `UserProfileDTO` { id, email, firstName, lastName, role, profile }

---

## SERVICE 2: `job-service` (port 8082)

### Entities
```java
// JobOffer.java
- Long id
- String title
- String description
- String company
- String location
- ContractType contractType  // enum: CDI, CDD, INTERNSHIP, FREELANCE, PART_TIME
- String salary (optional)
- String experienceLevel  // enum: JUNIOR, MID, SENIOR, LEAD
- List<String> requiredSkills
- Long employerId  // from user-service (no FK — microservices)
- JobStatus status  // enum: OPEN, CLOSED, PAUSED
- LocalDateTime publishedAt
- LocalDateTime expiresAt
- int applicationCount  // denormalized counter
```

### REST Endpoints
```
POST   /api/jobs                          → Create job (EMPLOYER only)
GET    /api/jobs                          → List all OPEN jobs (paginated: ?page=0&size=10)
GET    /api/jobs/{id}                     → Get job details
PUT    /api/jobs/{id}                     → Update job (owner EMPLOYER only)
DELETE /api/jobs/{id}                     → Delete job (owner only)
GET    /api/jobs/search?query=&location=&contractType=&experienceLevel=  → Search with filters
GET    /api/jobs/employer/{employerId}    → All jobs by employer
PATCH  /api/jobs/{id}/status              → Change status (OPEN/CLOSED/PAUSED)
```

### Search Logic
- Full-text search on `title` and `description` using `ILIKE`
- Filter by: location, contractType, experienceLevel, status
- Sort by: publishedAt DESC (default), salary

### Security
- Read endpoints (GET) → public (no auth required)
- Write endpoints → require JWT with role EMPLOYER
- `PUT/DELETE` → verify `employerId` matches JWT subject

---

## SERVICE 3: `application-service` (port 8083)

### Entities
```java
// Application.java
- Long id
- Long candidateId     // from user-service
- Long jobId           // from job-service
- String coverLetter
- ApplicationStatus status  // enum: PENDING, REVIEWED, INTERVIEW, ACCEPTED, REJECTED
- LocalDateTime appliedAt
- LocalDateTime updatedAt
- String employerNote  // internal notes by employer
```

### REST Endpoints
```
POST   /api/applications                          → Apply to a job (CANDIDATE only)
GET    /api/applications/{id}                     → Get application details
GET    /api/applications/candidate/{candidateId}  → All applications by candidate
GET    /api/applications/job/{jobId}              → All applications for a job (EMPLOYER)
PATCH  /api/applications/{id}/status              → Update status (EMPLOYER only)
DELETE /api/applications/{id}                     → Withdraw application (CANDIDATE, only if PENDING)
```

### Business Rules
- A candidate cannot apply twice to the same job (unique constraint on candidateId + jobId)
- Only EMPLOYER can change status
- On every status change → publish RabbitMQ event to `application.status.changed` exchange

### RabbitMQ Event Published
```json
{
  "eventType": "APPLICATION_STATUS_CHANGED",
  "applicationId": 1,
  "candidateId": 42,
  "jobId": 7,
  "jobTitle": "Software Engineer",
  "newStatus": "ACCEPTED",
  "candidateEmail": "john@example.com",
  "employerCompany": "TechCorp",
  "timestamp": "2024-01-15T10:30:00"
}
```

---

## SERVICE 4: `notification-service` (port 8084)

### Purpose
Listens to RabbitMQ events and sends transactional emails.

### RabbitMQ Config
- Exchange: `recruitment.events` (topic exchange)
- Queues:
  - `notification.application.status` → routing key `application.status.changed`
  - `notification.interview.reminder` → routing key `interview.reminder`

### Email Templates (Thymeleaf HTML)
Create beautiful HTML email templates for:

1. **Application Received** (to candidate): "Your application for [JOB_TITLE] at [COMPANY] has been received."
2. **Application Status Changed** (to candidate): "Your application status changed to [STATUS]."
3. **New Application** (to employer): "A new candidate applied to your job [JOB_TITLE]."
4. **Interview Invitation** (to candidate): "You are invited for an interview for [JOB_TITLE]."

### Config (application.yml)
```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${MAIL_USERNAME}
    password: ${MAIL_PASSWORD}
    properties:
      mail.smtp.auth: true
      mail.smtp.starttls.enable: true
```

---

## SERVICE 5: `reporting-service` (port 8085)

### Purpose
Aggregates data from all services using **REST calls** (via WebClient) and provides analytics.

### REST Endpoints
```
GET /api/reports/overview          → Global platform stats
GET /api/reports/jobs              → Job offer statistics
GET /api/reports/applications      → Application statistics
GET /api/reports/employer/{id}     → Employer-specific report
```

### Response Examples

**GET /api/reports/overview**
```json
{
  "totalUsers": 1250,
  "totalCandidates": 980,
  "totalEmployers": 270,
  "totalJobOffers": 340,
  "openJobOffers": 210,
  "totalApplications": 2870,
  "applicationsByStatus": {
    "PENDING": 1200,
    "REVIEWED": 430,
    "INTERVIEW": 180,
    "ACCEPTED": 620,
    "REJECTED": 440
  },
  "topLocations": ["Casablanca", "Rabat", "Paris"],
  "generatedAt": "2024-01-15T10:00:00"
}
```

**GET /api/reports/employer/{id}**
```json
{
  "employerId": 5,
  "companyName": "TechCorp",
  "totalJobsPosted": 12,
  "openJobs": 4,
  "totalApplicationsReceived": 87,
  "acceptanceRate": 0.23,
  "averageApplicationsPerJob": 7.25,
  "jobPerformance": [
    { "jobId": 1, "title": "Java Dev", "applications": 34, "status": "OPEN" }
  ]
}
```

---

## SERVICE 6: `api-gateway` (port 8080)

### Routes Configuration (application.yml)
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: http://user-service:8081
          predicates:
            - Path=/api/users/**
        - id: job-service
          uri: http://job-service:8082
          predicates:
            - Path=/api/jobs/**
        - id: application-service
          uri: http://application-service:8083
          predicates:
            - Path=/api/applications/**
        - id: notification-service
          uri: http://notification-service:8084
          predicates:
            - Path=/api/notifications/**
        - id: reporting-service
          uri: http://reporting-service:8085
          predicates:
            - Path=/api/reports/**
      globalcors:
        corsConfigurations:
          '[/**]':
            allowedOrigins: "*"
            allowedMethods: "*"
            allowedHeaders: "*"
```

### JWT Validation Filter
- Intercept every request (except `/api/users/login` and `/api/users/register`)
- Validate JWT using the JWKS endpoint of user-service
- Forward user info in headers: `X-User-Id`, `X-User-Email`, `X-User-Role`

---

## SERVICE 7: `frontend-app` (port 5173 dev / 80 prod)

### Init Command
```bash
npm create vite@latest frontend-app -- --template react-ts
cd frontend-app
npm install
npm install axios react-router-dom @tanstack/react-query zustand react-hook-form zod @hookform/resolvers lucide-react react-hot-toast recharts
npm install -D tailwindcss postcss autoprefixer @types/node
npx tailwindcss init -p
```

### Tech Stack
- **React 18** + **TypeScript**
- **Vite** — dev server & bundler
- **React Router v6** — client-side routing
- **Axios** — HTTP client with interceptors for JWT
- **TanStack Query (React Query)** — server state management & caching
- **Zustand** — global auth state store
- **React Hook Form + Zod** — form validation
- **Tailwind CSS** — utility-first styling
- **Recharts** — charts for admin dashboard
- **Lucide React** — icons
- **React Hot Toast** — notifications

---

### Folder Structure
```
frontend-app/src/
├── api/                  # Axios instances & API call functions
│   ├── axiosInstance.ts  # Base axios config with JWT interceptor
│   ├── auth.api.ts
│   ├── jobs.api.ts
│   ├── applications.api.ts
│   └── reports.api.ts
├── components/           # Reusable UI components
│   ├── common/           # Button, Input, Modal, Badge, Spinner, etc.
│   ├── layout/           # Navbar, Sidebar, Footer, PageWrapper
│   ├── jobs/             # JobCard, JobFilters, JobList
│   └── applications/     # ApplicationCard, StatusBadge, ApplicationTable
├── pages/                # One folder per role
│   ├── public/           # HomePage, JobsPage, JobDetailPage, LoginPage, RegisterPage
│   ├── candidate/        # CandidateDashboard, MyApplications, Profile, ApplyPage
│   ├── employer/         # EmployerDashboard, ManageJobs, CreateJob, EditJob, ViewApplications
│   └── admin/            # AdminDashboard, UsersManagement, ReportsPage
├── store/
│   └── authStore.ts      # Zustand store: user, token, role, login(), logout()
├── hooks/                # Custom hooks (useAuth, useJobs, useApplications)
├── types/                # TypeScript interfaces matching backend DTOs
│   ├── user.types.ts
│   ├── job.types.ts
│   ├── application.types.ts
│   └── report.types.ts
├── utils/                # helpers, formatDate, formatSalary
├── router/
│   └── AppRouter.tsx     # All routes with ProtectedRoute wrapper
├── App.tsx
└── main.tsx
```

---

### `src/api/axiosInstance.ts`
```typescript
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 10000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally → redirect to login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

### `src/store/authStore.ts`
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CANDIDATE' | 'EMPLOYER' | 'ADMIN';
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
);
```

---

### `src/router/AppRouter.tsx`
```typescript
// Routes organized by role with ProtectedRoute guard
// Public routes (no auth):
//   /                → HomePage (job listings for visitors)
//   /jobs            → All open jobs with search/filter
//   /jobs/:id        → Job detail page
//   /login           → Login page
//   /register        → Register page (choose: Candidate or Employer)

// CANDIDATE routes (auth + role=CANDIDATE):
//   /candidate/dashboard     → My applications summary + stats
//   /candidate/applications  → Full list of my applications with status
//   /candidate/profile       → Edit profile + upload CV
//   /jobs/:id/apply          → Apply form with cover letter

// EMPLOYER routes (auth + role=EMPLOYER):
//   /employer/dashboard      → Stats: total jobs, applications received, acceptance rate
//   /employer/jobs           → My job offers list (OPEN/CLOSED/PAUSED)
//   /employer/jobs/new       → Create new job offer form
//   /employer/jobs/:id/edit  → Edit job offer
//   /employer/jobs/:id/applications → View all candidates for a job + change status
//   /employer/profile        → Company profile

// ADMIN routes (auth + role=ADMIN):
//   /admin/dashboard    → Global platform stats (from reporting-service)
//   /admin/users        → All users list + delete
//   /admin/reports      → Charts: applications by status, jobs by location, etc.
```

---

### TypeScript Types (`src/types/`)

```typescript
// job.types.ts
export interface JobOffer {
  id: number;
  title: string;
  description: string;
  company: string;
  location: string;
  contractType: 'CDI' | 'CDD' | 'INTERNSHIP' | 'FREELANCE' | 'PART_TIME';
  salary?: string;
  experienceLevel: 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD';
  requiredSkills: string[];
  status: 'OPEN' | 'CLOSED' | 'PAUSED';
  employerId: number;
  publishedAt: string;
  expiresAt?: string;
  applicationCount: number;
}

export interface JobSearchParams {
  query?: string;
  location?: string;
  contractType?: string;
  experienceLevel?: string;
  page?: number;
  size?: number;
}

// application.types.ts
export interface Application {
  id: number;
  candidateId: number;
  jobId: number;
  coverLetter: string;
  status: 'PENDING' | 'REVIEWED' | 'INTERVIEW' | 'ACCEPTED' | 'REJECTED';
  appliedAt: string;
  updatedAt: string;
  employerNote?: string;
}

// report.types.ts
export interface PlatformOverview {
  totalUsers: number;
  totalCandidates: number;
  totalEmployers: number;
  totalJobOffers: number;
  openJobOffers: number;
  totalApplications: number;
  applicationsByStatus: Record<string, number>;
  topLocations: string[];
}
```

---

### Pages to Implement

#### 1. `HomePage` (public)
- Hero section with search bar (query + location)
- Featured job cards grid (latest 6 open jobs)
- Stats banner: "X jobs available, Y companies hiring"
- Call-to-action: Register as Candidate / Post a Job

#### 2. `JobsPage` (public)
- Left sidebar: filters (contractType, experienceLevel, location)
- Right: paginated list of `JobCard` components
- Search bar at top
- Each `JobCard` shows: title, company, location, contract type badge, salary, posted date, "Apply" button

#### 3. `JobDetailPage` (public)
- Full job description
- Required skills as tags
- Sidebar: company info, contract type, salary, experience level
- "Apply Now" button → redirects to login if not authenticated

#### 4. `CandidateDashboard`
- Summary cards: Total Applications, Pending, Interviews, Accepted
- Recent applications table with status badges (color-coded)
- Quick link: "Browse Jobs"

#### 5. `MyApplications` (candidate)
- Full table: Job Title | Company | Applied Date | Status | Actions
- Status badge colors: PENDING=yellow, REVIEWED=blue, INTERVIEW=purple, ACCEPTED=green, REJECTED=red
- "Withdraw" button for PENDING applications

#### 6. `EmployerDashboard`
- Stats cards: Active Jobs, Total Applications Received, Acceptance Rate, New Applications Today
- Bar chart (Recharts): Applications per job
- Recent applications needing review

#### 7. `ManageJobs` (employer)
- Table of all employer's jobs: Title | Status | Applications | Published Date | Actions
- Actions: Edit, View Applications, Change Status (OPEN/PAUSE/CLOSE), Delete
- "Post New Job" button

#### 8. `CreateJob` / `EditJob` (employer)
- Form fields: title, description (textarea), location, contractType (select), experienceLevel (select), salary (optional), requiredSkills (tag input), expiresAt (date picker)
- Zod validation schema
- Submit → POST /api/jobs or PUT /api/jobs/:id

#### 9. `ViewApplications` (employer — for a specific job)
- Table: Candidate Name | Applied Date | Status | Cover Letter (expandable) | Actions
- Status dropdown per row → PATCH /api/applications/:id/status
- Download CV button

#### 10. `AdminDashboard`
- 4 KPI cards: Total Users, Total Jobs, Total Applications, Acceptance Rate
- Pie chart: Applications by status
- Line chart: New registrations over time
- Bar chart: Jobs by contract type
- Table: Top employers by applications received

---

### `.env` file
```env
VITE_API_BASE_URL=http://localhost:8080
```

---

### `Dockerfile` (frontend)
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### `nginx.conf`
```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  # React Router — redirect all routes to index.html
  location / {
    try_files $uri $uri/ /index.html;
  }

  # Proxy API calls to backend gateway
  location /api/ {
    proxy_pass http://api-gateway:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

> With this nginx config, the frontend container itself proxies `/api/` to the gateway — so `VITE_API_BASE_URL` can be empty in production and all API calls go through the same origin (no CORS issues).

---

## DOCKER COMPOSE (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  # ============================================================
  # INFRASTRUCTURE
  # ============================================================
  postgres-users:
    image: postgres:16
    environment:
      POSTGRES_DB: users_db
      POSTGRES_USER: recruit
      POSTGRES_PASSWORD: recruit123
    ports: ["5432:5432"]
    volumes: [users_data:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U recruit -d users_db"]
      interval: 10s
      retries: 5

  postgres-jobs:
    image: postgres:16
    environment:
      POSTGRES_DB: jobs_db
      POSTGRES_USER: recruit
      POSTGRES_PASSWORD: recruit123
    ports: ["5433:5432"]
    volumes: [jobs_data:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U recruit -d jobs_db"]
      interval: 10s
      retries: 5

  postgres-applications:
    image: postgres:16
    environment:
      POSTGRES_DB: applications_db
      POSTGRES_USER: recruit
      POSTGRES_PASSWORD: recruit123
    ports: ["5434:5432"]
    volumes: [apps_data:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U recruit -d applications_db"]
      interval: 10s
      retries: 5

  postgres-reporting:
    image: postgres:16
    environment:
      POSTGRES_DB: reporting_db
      POSTGRES_USER: recruit
      POSTGRES_PASSWORD: recruit123
    ports: ["5435:5432"]
    volumes: [reporting_data:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U recruit -d reporting_db"]
      interval: 10s
      retries: 5

  rabbitmq:
    image: rabbitmq:3.13-management
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: recruit
      RABBITMQ_DEFAULT_PASS: recruit123
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "ping"]
      interval: 10s
      retries: 5

  # ============================================================
  # TIER 1 — Config Server (no dependencies)
  # ============================================================
  config-server:
    build: ./config-server
    ports: ["8888:8888"]
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8888/actuator/health"]
      interval: 10s
      retries: 10
      start_period: 30s

  # ============================================================
  # TIER 2 — Discovery Service (needs config-server)
  # ============================================================
  discovery-service:
    build: ./discovery-service
    ports: ["8761:8761"]
    environment:
      SPRING_CONFIG_IMPORT: "optional:configserver:http://config-server:8888"
    depends_on:
      config-server:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8761/actuator/health"]
      interval: 10s
      retries: 10
      start_period: 30s

  # ============================================================
  # TIER 3 — Business Services (need config + discovery + dbs)
  # ============================================================
  user-service:
    build: ./user-service
    ports: ["8081:8081"]
    environment:
      SPRING_CONFIG_IMPORT: "optional:configserver:http://config-server:8888"
      EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: http://discovery-service:8761/eureka/
    depends_on:
      config-server:
        condition: service_healthy
      discovery-service:
        condition: service_healthy
      postgres-users:
        condition: service_healthy

  job-service:
    build: ./job-service
    ports: ["8082:8082"]
    environment:
      SPRING_CONFIG_IMPORT: "optional:configserver:http://config-server:8888"
      EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: http://discovery-service:8761/eureka/
    depends_on:
      config-server:
        condition: service_healthy
      discovery-service:
        condition: service_healthy
      postgres-jobs:
        condition: service_healthy

  application-service:
    build: ./application-service
    ports: ["8083:8083"]
    environment:
      SPRING_CONFIG_IMPORT: "optional:configserver:http://config-server:8888"
      EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: http://discovery-service:8761/eureka/
    depends_on:
      config-server:
        condition: service_healthy
      discovery-service:
        condition: service_healthy
      postgres-applications:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy

  notification-service:
    build: ./notification-service
    ports: ["8084:8084"]
    environment:
      SPRING_CONFIG_IMPORT: "optional:configserver:http://config-server:8888"
      EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: http://discovery-service:8761/eureka/
      MAIL_USERNAME: ${MAIL_USERNAME}
      MAIL_PASSWORD: ${MAIL_PASSWORD}
    depends_on:
      config-server:
        condition: service_healthy
      discovery-service:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy

  reporting-service:
    build: ./reporting-service
    ports: ["8085:8085"]
    environment:
      SPRING_CONFIG_IMPORT: "optional:configserver:http://config-server:8888"
      EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: http://discovery-service:8761/eureka/
    depends_on:
      config-server:
        condition: service_healthy
      discovery-service:
        condition: service_healthy
      postgres-reporting:
        condition: service_healthy

  # ============================================================
  # TIER 4 — API Gateway (needs all services registered in Eureka)
  # ============================================================
  api-gateway:
    build: ./api-gateway
    ports: ["8080:8080"]
    environment:
      SPRING_CONFIG_IMPORT: "optional:configserver:http://config-server:8888"
      EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: http://discovery-service:8761/eureka/
    depends_on:
      config-server:
        condition: service_healthy
      discovery-service:
        condition: service_healthy

  # ============================================================
  # TIER 5 — Frontend (needs api-gateway)
  # ============================================================
  frontend-app:
    build: ./frontend-app
    ports: ["80:80"]
    depends_on:
      - api-gateway

volumes:
  users_data:
  jobs_data:
  apps_data:
  reporting_data:
```

---

## DATABASE MIGRATIONS (Flyway)

For each service, create migration files in `src/main/resources/db/migration/`:

- `user-service`: `V1__create_users.sql`, `V2__create_candidate_profiles.sql`, `V3__create_employer_profiles.sql`
- `job-service`: `V1__create_job_offers.sql`
- `application-service`: `V1__create_applications.sql`
- `reporting-service`: `V1__create_report_cache.sql`

---

## ERROR HANDLING

Create a global `@RestControllerAdvice` in each service:
- `ResourceNotFoundException` → 404
- `UnauthorizedException` → 403
- `DuplicateApplicationException` → 409
- `ValidationException` → 400
- Generic Exception → 500

Standard error response:
```json
{
  "timestamp": "2024-01-15T10:00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Job offer with id 99 not found",
  "path": "/api/jobs/99"
}
```

---

## INSTRUCTIONS FOR THE AI AGENT

1. **Start with `config-server`** — everything else depends on it
2. **Then `discovery-service`** — must be up before business services
3. Implement business services in this order: user-service → job-service → application-service → notification-service → reporting-service → api-gateway
4. For each service:
   - Add `spring-cloud-starter-config` and `spring-cloud-starter-netflix-eureka-client` to `pom.xml`
   - Create `bootstrap.yml` with config server import and Eureka registration
   - Implement entities with JPA annotations
   - Create Flyway migration SQL files
   - Implement repositories (Spring Data JPA)
   - Implement service layer with full business logic
   - Implement REST controllers with proper validation
   - Create `Dockerfile` (multi-stage build with Java 21)
5. In `api-gateway`: use `lb://service-name` URIs (load-balanced via Eureka) instead of hardcoded URLs
6. Add `MapStruct` dependency to each service's `pom.xml` and create mapper interfaces
7. Use `@Valid` and Bean Validation annotations on all DTOs
8. Each service must have a health endpoint via Spring Actuator at `/actuator/health`
9. Generate RSA key pair in user-service and expose JWKS at `/.well-known/jwks.json`
10. After implementing all services, verify `docker-compose.yml` runs with `docker-compose up --build`
11. Create a `README.md` at the root with: setup instructions, API documentation, architecture diagram (ASCII), environment variables list, startup order explanation

---

## DELIVERABLES CHECKLIST

- [ ] `config-server` — running on port 8888, serving all service configs
- [ ] `discovery-service` — Eureka running on port 8761
- [ ] `user-service` — fully implemented with JWT
- [ ] `job-service` — fully implemented with search
- [ ] `application-service` — fully implemented with RabbitMQ publishing
- [ ] `notification-service` — fully implemented with email templates
- [ ] `reporting-service` — fully implemented with WebClient aggregation
- [ ] `api-gateway` — routes using `lb://` + JWT filter
- [ ] `frontend-app` — React + Vite + TypeScript, all 3 roles implemented
  - [ ] Public pages: HomePage, JobsPage, JobDetailPage, Login, Register
  - [ ] Candidate pages: Dashboard, MyApplications, Profile, ApplyPage
  - [ ] Employer pages: Dashboard, ManageJobs, CreateJob, EditJob, ViewApplications
  - [ ] Admin pages: Dashboard, UsersManagement, ReportsPage with charts
- [ ] All services registered in Eureka (`bootstrap.yml` configured)
- [ ] All configs centralized in `config-server/src/main/resources/config-repo/`
- [ ] `docker-compose.yml` — all services + databases + RabbitMQ + frontend + healthchecks
- [ ] Flyway migrations for all services
- [ ] Global exception handlers in all services
- [ ] `README.md` with full documentation and startup order
