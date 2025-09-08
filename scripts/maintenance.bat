@echo off
REM Maintenance script for SynProd (Windows)
REM This script provides common maintenance operations for the production deployment

setlocal enabledelayedexpansion

REM Configuration
set COMPOSE_FILE=docker-compose.prod.yml
set ENV_FILE=.env.production

REM Function to show usage
:show_usage
echo SynProd Maintenance Script
echo =========================
echo.
echo Usage: %0 [COMMAND]
echo.
echo Commands:
echo   status      - Show service status
echo   logs        - Show service logs
echo   restart     - Restart all services
echo   stop        - Stop all services
echo   start       - Start all services
echo   backup      - Create database backup
echo   restore     - Restore database from backup
echo   update      - Update and restart services
echo   clean       - Clean up unused Docker resources
echo   health      - Check service health
echo   shell       - Open shell in backend container
echo   db-shell    - Open PostgreSQL shell
echo.
goto :end

REM Function to show service status
:show_status
echo 📊 Service Status
echo ================
docker-compose -f "%COMPOSE_FILE%" ps
echo.

echo 🐳 Docker Images
echo ================
docker images | findstr synprod
echo.

echo 💾 Disk Usage
echo =============
docker system df
goto :end

REM Function to show logs
:show_logs
echo 📋 Service Logs
echo ===============
echo Press Ctrl+C to exit log viewing
echo.
docker-compose -f "%COMPOSE_FILE%" logs -f
goto :end

REM Function to restart services
:restart_services
echo 🔄 Restarting services...
docker-compose -f "%COMPOSE_FILE%" restart
echo ✅ Services restarted
goto :end

REM Function to stop services
:stop_services
echo 🛑 Stopping services...
docker-compose -f "%COMPOSE_FILE%" down
echo ✅ Services stopped
goto :end

REM Function to start services
:start_services
echo 🚀 Starting services...
docker-compose -f "%COMPOSE_FILE%" up -d
echo ✅ Services started
goto :end

REM Function to create backup
:create_backup
echo 💾 Creating database backup...

REM Create backup directory if it doesn't exist
if not exist "backups" mkdir "backups"

REM Create backup
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "timestamp=%YYYY%%MM%%DD%_%HH%%Min%%Sec%"

set "BACKUP_FILE=backups\synprod_backup_%timestamp%.sql"
docker-compose -f "%COMPOSE_FILE%" exec -T postgres pg_dump -U synprod synprod > "%BACKUP_FILE%"

echo ✅ Backup created: %BACKUP_FILE%
goto :end

REM Function to restore backup
:restore_backup
if "%~2"=="" (
    echo ❌ Please provide backup file path
    echo Usage: %0 restore ^<backup_file^>
    goto :end
)

set "BACKUP_FILE=%~2"

if not exist "%BACKUP_FILE%" (
    echo ❌ Backup file not found: %BACKUP_FILE%
    goto :end
)

echo 🔄 Restoring database from backup...
echo ⚠️  This will overwrite the current database!
set /p "confirm=Are you sure? (y/N): "

if /i "%confirm%"=="y" (
    REM Stop services
    docker-compose -f "%COMPOSE_FILE%" down
    
    REM Restore backup
    docker-compose -f "%COMPOSE_FILE%" exec -T postgres psql -U synprod -d synprod < "%BACKUP_FILE%"
    
    REM Start services
    docker-compose -f "%COMPOSE_FILE%" up -d
    
    echo ✅ Database restored from backup
) else (
    echo ℹ️  Restore cancelled
)
goto :end

REM Function to update services
:update_services
echo 🔄 Updating services...

REM Pull latest images
docker-compose -f "%COMPOSE_FILE%" pull

REM Rebuild and restart
docker-compose -f "%COMPOSE_FILE%" up -d --build

echo ✅ Services updated
goto :end

REM Function to clean up Docker resources
:clean_docker
echo 🧹 Cleaning up Docker resources...

REM Remove unused containers
docker container prune -f

REM Remove unused images
docker image prune -f

REM Remove unused volumes
docker volume prune -f

REM Remove unused networks
docker network prune -f

echo ✅ Docker cleanup completed
goto :end

REM Function to check service health
:check_health
echo 🏥 Checking service health...
echo ============================

REM Check PostgreSQL
echo -n PostgreSQL: 
docker-compose -f "%COMPOSE_FILE%" exec -T postgres pg_isready -U synprod >nul 2>&1
if errorlevel 1 (
    echo ❌ Unhealthy
) else (
    echo ✅ Healthy
)

REM Check Backend
echo -n Backend: 
curl -f http://localhost:8080/api/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Unhealthy
) else (
    echo ✅ Healthy
)

REM Check Nginx
echo -n Nginx: 
curl -f http://localhost/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Unhealthy
) else (
    echo ✅ Healthy
)
goto :end

REM Function to open shell in backend
:open_shell
echo 🐚 Opening shell in backend container...
docker-compose -f "%COMPOSE_FILE%" exec backend /bin/bash
goto :end

REM Function to open database shell
:open_db_shell
echo 🗄️  Opening PostgreSQL shell...
docker-compose -f "%COMPOSE_FILE%" exec postgres psql -U synprod -d synprod
goto :end

REM Main function
if "%~1"=="status" goto :show_status
if "%~1"=="logs" goto :show_logs
if "%~1"=="restart" goto :restart_services
if "%~1"=="stop" goto :stop_services
if "%~1"=="start" goto :start_services
if "%~1"=="backup" goto :create_backup
if "%~1"=="restore" goto :restore_backup
if "%~1"=="update" goto :update_services
if "%~1"=="clean" goto :clean_docker
if "%~1"=="health" goto :check_health
if "%~1"=="shell" goto :open_shell
if "%~1"=="db-shell" goto :open_db_shell

REM Default to show usage
goto :show_usage

:end
echo Maintenance operation completed.
