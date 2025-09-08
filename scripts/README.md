# SynProd Deployment Scripts

This directory contains simplified deployment scripts for the SynProd application.

## Quick Start

To deploy the complete application, run these scripts in order:

### 1. Deploy Frontend
```bash
# Windows
scripts\deploy-frontend.bat

# Linux/Mac
./scripts/deploy-frontend.sh
```

This script:
- Installs npm dependencies if needed
- Builds the React frontend using Nx
- Copies the built files to `nginx/html/` directory

### 2. Deploy Backend
```bash
# Windows
scripts\deploy-backend.bat

# Linux/Mac
./scripts/deploy-backend.sh
```

This script:
- Builds the Spring Boot backend using Gradle
- Creates the Docker image `synprod-backend:latest`

### 3. Start Containers
```bash
# Windows
scripts\start-containers.bat

# Linux/Mac
./scripts/start-containers.sh
```

This script:
- Builds the nginx Docker image if needed
- Starts all services using docker-compose
- Waits for services to be healthy
- Shows application URLs and status

## Prerequisites

- Node.js and npm (for frontend)
- Java 21 (for backend)
- Docker and Docker Compose
- Environment file `.env.production` configured

## Application URLs

After successful deployment:
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8080/api
- **Health Check**: http://localhost/health

## Useful Commands

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

## Other Scripts

- `backup.bat/sh` - Database backup
- `restore.bat/sh` - Database restore
- `maintenance.bat/sh` - Maintenance operations
- `migrate.sh` - Database migrations
- `schedule-backup.sh` - Backup scheduling
