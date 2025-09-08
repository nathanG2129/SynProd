@echo off
REM Production deployment script for SynProd (Windows)
REM This script builds and deploys the complete application stack

setlocal enabledelayedexpansion

REM Configuration
set COMPOSE_FILE=docker-compose.prod.yml
set ENV_FILE=.env.production
set BACKUP_DIR=backups
set LOG_DIR=logs
set DATA_DIR=data

echo 🚀 SynProd Production Deployment
echo ================================

REM Function to check prerequisites
:check_prerequisites
echo 🔍 Checking prerequisites...

REM Check Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker and try again.
    exit /b 1
)

REM Check Docker Compose
docker-compose --version >nul 2>&1
if errorlevel 1 (
    docker compose version >nul 2>&1
    if errorlevel 1 (
        echo ❌ Docker Compose is not installed. Please install Docker Compose and try again.
        exit /b 1
    )
)

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Check Node.js for frontend build
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js and try again.
    exit /b 1
)

REM Check npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm and try again.
    exit /b 1
)

echo ✅ All prerequisites are met
goto :check_environment

REM Function to check environment file
:check_environment
echo 🔧 Checking environment configuration...

if not exist "%ENV_FILE%" (
    echo ❌ Environment file %ENV_FILE% not found
    echo 💡 Please copy deployment/env.production.template to %ENV_FILE% and configure it
    exit /b 1
)

echo ✅ Environment configuration is valid
goto :create_directories

REM Function to create necessary directories
:create_directories
echo 📁 Creating necessary directories...

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
if not exist "%LOG_DIR%\backend" mkdir "%LOG_DIR%\backend"
if not exist "%LOG_DIR%\nginx" mkdir "%LOG_DIR%\nginx"
if not exist "%DATA_DIR%\postgres" mkdir "%DATA_DIR%\postgres"
if not exist "nginx\html" mkdir "nginx\html"

echo ✅ Directories created
goto :build_frontend

REM Function to build frontend
:build_frontend
echo 🔨 Building frontend...

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Build frontend
npx nx build frontend

REM Copy to nginx directory
echo 📋 Copying frontend files to nginx directory...
xcopy "dist\frontend\*" "nginx\html\" /E /I /Y

echo ✅ Frontend built and prepared
goto :build_images

REM Function to build Docker images
:build_images
echo 🐳 Building Docker images...

REM Build backend image
echo 🔨 Building backend image...
docker build -t synprod-backend:latest ./backend

REM Build nginx image
echo 🔨 Building nginx image...
docker build -t synprod-nginx:latest ./nginx

echo ✅ Docker images built
goto :stop_services

REM Function to stop existing services
:stop_services
echo 🛑 Stopping existing services...

docker-compose -f "%COMPOSE_FILE%" ps -q | findstr . >nul
if not errorlevel 1 (
    docker-compose -f "%COMPOSE_FILE%" down
)

echo ✅ Services stopped
goto :start_services

REM Function to start services
:start_services
echo 🚀 Starting services...

REM Start services
docker-compose -f "%COMPOSE_FILE%" up -d

echo ✅ Services started
goto :wait_for_services

REM Function to wait for services to be healthy
:wait_for_services
echo ⏳ Waiting for services to be healthy...

REM Wait for postgres
echo 📊 Waiting for PostgreSQL...
timeout /t 60 /nobreak >nul
:wait_postgres
docker-compose -f "%COMPOSE_FILE%" exec -T postgres pg_isready -U synprod >nul 2>&1
if errorlevel 1 (
    timeout /t 2 /nobreak >nul
    goto :wait_postgres
)

REM Wait for backend
echo 📊 Waiting for Backend...
timeout /t 120 /nobreak >nul
:wait_backend
curl -f http://localhost:8080/api/health >nul 2>&1
if errorlevel 1 (
    timeout /t 5 /nobreak >nul
    goto :wait_backend
)

REM Wait for nginx
echo 📊 Waiting for Nginx...
timeout /t 60 /nobreak >nul
:wait_nginx
curl -f http://localhost/health >nul 2>&1
if errorlevel 1 (
    timeout /t 2 /nobreak >nul
    goto :wait_nginx
)

echo ✅ All services are healthy
goto :show_status

REM Function to show deployment status
:show_status
echo 🎉 Deployment completed successfully!
echo ================================
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
echo   Backup database: docker-compose -f %COMPOSE_FILE% exec backup /backup.sh

goto :end

:end
echo Deployment process completed.
