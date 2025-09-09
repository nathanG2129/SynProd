# SynProd

A production‑oriented web application to centralize product recipes and operational data. Built with React 19, Spring Boot 3.5, and PostgreSQL, it delivers stateless JWT authentication with refresh tokens, RBAC‑protected routes, and secure user flows. Operators get validated step‑by‑step instructions, while managers/admins manage product formulations and master data.

## Project Context

- Centralizes product recipes and operational data to improve visibility and decision‑making for the production team.
- Secure, role‑based system: production members view validated step‑by‑step instructions; managers and admins manage product formulations and master data.
- Intuitive recipe visualization outlining ingredient specifications, procedures, and quality control checkpoints.

## Tech Stack

### Backend
- Java 21, Spring Boot 3.5 (Web, Validation, DevTools)
- Spring Security with JWT (jjwt), BCrypt hashing
- Spring Data JPA (Hibernate)
- PostgreSQL (JDBC driver), Gradle build
- Email via Spring Mail; dotenv for env management

### Frontend
- React 19 + TypeScript, Vite (dev/build), React Router
- Axios for API calls, Context API for auth/session state
- MUI v7 with Emotion theming/styling
- @react-pdf/renderer for client‑side PDF generation

### Tooling & Platform
- Nx v21 monorepo (React + Vite plugins)
- Vitest + jsdom test setup
- Docker and Docker Compose; Nginx reverse proxy
- Deployment scripts for backend/frontend; environment templating
- Application and Nginx logs; monitoring placeholders

## Features

- Domain
  - Central repository for product recipes and operational data
  - Role‑aware views: operators see validated instructions; managers/admins maintain formulations and master data
  - Recipe visualization: ingredients, procedures, and quality control checkpoints

- Authentication & Authorization
  - Registration with email verification, login, password reset, refresh tokens
  - RBAC‑protected routes and server‑side role checks

- Security
  - Input validation, strong password rules with BCrypt hashing
  - Configurable CORS and security headers per environment

- User Experience
  - Real‑time form validation and password strength indicators
  - Responsive UI with MUI v7 + Emotion theming

- Documents
  - Client‑side PDF generation via @react-pdf/renderer (exportable views)

## Repository Structure

```
SynProd/
├─ backend/                # Spring Boot app (Gradle)
├─ frontend/               # React 19 + TS app (Vite, Nx)
├─ nginx/                  # Reverse proxy config and static
├─ scripts/                # Build/deploy/backup/restore helpers
├─ deployment/             # Guides and environment templates
├─ data/postgres/          # Local Postgres data (dev)
└─ docker-compose.yml
```

## Quick Start

### Prerequisites
- Java 21
- Node.js 18+
- Docker (optional but recommended for local DB)

### 1) Environment
- Create a `.env` at the repo root for shared values (see `deployment/env.production.template` for reference). Backend also honors Spring profiles and dotenv.

### 2) Backend
```bash
cd backend
./gradlew bootRun
```

### 3) Frontend
```bash
npm install
npx nx serve frontend
```

### 4) Docker Compose (optional)
```bash
docker compose up -d
```

## API Overview

- POST `/api/auth/register` – Create user, send verification email
- GET `/api/auth/verify-email` – Verify email via token
- POST `/api/auth/login` – Obtain access/refresh tokens
- POST `/api/auth/refresh` – Refresh access token
- POST `/api/auth/forgot-password` – Request password reset
- POST `/api/auth/reset-password` – Reset password with token
- GET `/api/user/profile` – Current user profile (auth required)

Token TTLs, CORS, and security headers are environment‑configurable.

## Deployment

- Nginx serves the frontend and proxies API to the backend
- Scripts under `scripts/` cover build, deploy, backup/restore, and maintenance
- Environment templating via `deployment/` and `.env` files
- Production Docker images can be built via `docker-compose.prod.yml`





## License

MIT
