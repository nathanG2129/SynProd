@echo off
REM Quick deployment script for SynProd (Windows)
REM This script provides a fast deployment option for development and testing

setlocal enabledelayedexpansion

REM Configuration
set COMPOSE_FILE=docker-compose.prod.yml
set ENV_FILE=.env.production

echo ⚡ SynProd Quick Deployment
echo ===========================

REM Function to check if environment file exists
:check_environment
if not exist "%ENV_FILE%" (
    echo ❌ Environment file %ENV_FILE% not found
    echo 💡 Please copy deployment/env.production.template to %ENV_FILE% and configure it
    exit /b 1
)
echo ✅ Environment file found
goto :check_builds

REM Function to check if builds exist
:check_builds
echo 🔍 Checking if builds exist...

REM Check frontend build
if not exist "nginx\html" (
    echo ⚠️  Frontend build not found. Building frontend...
    call scripts\build-frontend.bat
) else (
    dir "nginx\html" /B | findstr . >nul
    if errorlevel 1 (
        echo ⚠️  Frontend build not found. Building frontend...
        call scripts\build-frontend.bat
    ) else (
        echo ✅ Frontend build found
    )
)

REM Check if Docker images exist
docker images | findstr "synprod-backend" >nul
if errorlevel 1 (
    echo ⚠️  Backend Docker image not found. Building backend...
    call scripts\build-backend.bat
) else (
    echo ✅ Backend Docker image found
)

docker images | findstr "synprod-nginx" >nul
if errorlevel 1 (
    echo ⚠️  Nginx Docker image not found. Building nginx...
    docker build -t synprod-nginx:latest ./nginx
) else (
    echo ✅ Nginx Docker image found
)

goto :stop_services

REM Function to stop existing services
:stop_services
echo 🛑 Stopping existing services...

docker-compose -f "%COMPOSE_FILE%" ps -q | findstr . >nul
if not errorlevel 1 (
    docker-compose -f "%COMPOSE_FILE%" down
    echo ✅ Services stopped
) else (
    echo ℹ️  No running services found
)

goto :start_services

REM Function to start services
:start_services
echo 🚀 Starting services...

REM Start services
docker-compose -f "%COMPOSE_FILE%" up -d

echo ✅ Services started
goto :wait_for_services

REM Function to wait for services
:wait_for_services
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

echo ✅ Services are ready
goto :show_status

REM Function to show status
:show_status
echo 🎉 Quick deployment completed!
echo ===========================

echo 📊 Service Status:
docker-compose -f "%COMPOSE_FILE%" ps

echo 🌐 Application URLs:
echo   Frontend: http://localhost
echo   Backend API: http://localhost:8080/api
echo   Health Check: http://localhost/health

echo 📋 Quick Commands:
echo   View logs: docker-compose -f %COMPOSE_FILE% logs -f
echo   Stop: docker-compose -f %COMPOSE_FILE% down
echo   Restart: docker-compose -f %COMPOSE_FILE% restart

goto :end

:end
echo Quick deployment completed.
