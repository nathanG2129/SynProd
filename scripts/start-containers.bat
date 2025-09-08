@echo off
REM Container startup script for SynProd (Windows)
REM This script starts the Docker containers for backend and nginx

setlocal enabledelayedexpansion

REM Configuration
set COMPOSE_FILE=docker-compose.prod.yml
set ENV_FILE=.env.production

echo 🚀 SynProd Container Startup
echo ===========================

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Check if environment file exists
if not exist "%ENV_FILE%" (
    echo ❌ Environment file %ENV_FILE% not found
    echo 💡 Please copy deployment/env.production.template to %ENV_FILE% and configure it
    exit /b 1
)

REM Check if Docker images exist
docker images | findstr "synprod-backend" >nul
if errorlevel 1 (
    echo ❌ Backend Docker image not found
    echo 💡 Please run deploy-backend.bat first
    exit /b 1
)

REM Check if nginx html directory exists and has content
if not exist "nginx\html" (
    echo ❌ Nginx html directory not found
    echo 💡 Please run deploy-frontend.bat first
    exit /b 1
) else (
    dir "nginx\html" /B | findstr . >nul
    if errorlevel 1 (
        echo ❌ Nginx html directory is empty
        echo 💡 Please run deploy-frontend.bat first
        exit /b 1
    )
)

echo ✅ Prerequisites check passed

REM Build nginx image if it doesn't exist
docker images | findstr "synprod-nginx" >nul
if errorlevel 1 (
    echo 🔨 Building nginx Docker image...
    docker build -t synprod-nginx:latest ./nginx
    echo ✅ Nginx Docker image built
) else (
    echo ✅ Nginx Docker image found
)

REM Stop existing services if running
echo 🛑 Stopping existing services...
docker-compose -f "%COMPOSE_FILE%" ps -q | findstr . >nul
if not errorlevel 1 (
    docker-compose -f "%COMPOSE_FILE%" down
    echo ✅ Services stopped
) else (
    echo ℹ️  No running services found
)

REM Start services
echo 🚀 Starting services...
docker-compose -f "%COMPOSE_FILE%" up -d

echo ✅ Services started

REM Wait a moment for initial startup
echo ⏳ Waiting for initial startup...
timeout /t 10 /nobreak >nul

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...

REM Wait for postgres
echo 📊 Waiting for PostgreSQL...
timeout /t 30 /nobreak >nul
:wait_postgres
docker-compose -f "%COMPOSE_FILE%" exec -T postgres pg_isready -U synprod >nul 2>&1
if errorlevel 1 (
    timeout /t 2 /nobreak >nul
    goto :wait_postgres
)

REM Wait for backend
echo 📊 Waiting for Backend...
timeout /t 60 /nobreak >nul
:wait_backend
curl -f http://localhost:8080/api/health >nul 2>&1
if errorlevel 1 (
    timeout /t 5 /nobreak >nul
    goto :wait_backend
)

REM Wait for nginx
echo 📊 Waiting for Nginx...
timeout /t 30 /nobreak >nul
:wait_nginx
curl -f http://localhost/health >nul 2>&1
if errorlevel 1 (
    timeout /t 2 /nobreak >nul
    goto :wait_nginx
)

echo ✅ All services are ready

REM Show status
echo 🎉 SynProd is now running!
echo =========================

echo 📊 Service Status:
docker-compose -f "%COMPOSE_FILE%" ps

echo 🌐 Application URLs:
echo   Frontend: http://localhost
echo   Backend API: http://localhost:8080/api
echo   Health Check: http://localhost/health

echo 📋 Useful Commands:
echo   View logs: docker-compose -f %COMPOSE_FILE% logs -f
echo   Stop services: docker-compose -f %COMPOSE_FILE% down
echo   Restart services: docker-compose -f %COMPOSE_FILE% restart
