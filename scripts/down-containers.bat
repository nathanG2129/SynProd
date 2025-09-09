@echo off
REM Stop and remove production containers (and orphans) for SynProd

setlocal enabledelayedexpansion

REM Configuration
set COMPOSE_FILE=docker-compose.prod.yml
set ENV_FILE=.env.production

echo 🧹 Shutting down production containers
echo ======================================

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker Desktop and try again.
    exit /b 1
)

REM Check if compose file exists
if not exist "%COMPOSE_FILE%" (
    echo ❌ Compose file %COMPOSE_FILE% not found in workspace root
    exit /b 1
)

REM Bring down services and remove orphans
echo 🛑 Bringing down services...
docker-compose -f "%COMPOSE_FILE%" --env-file "%ENV_FILE%" down --remove-orphans
if errorlevel 1 (
    echo ❌ Failed to bring down services. See errors above.
    exit /b 1
)

echo ✅ Production containers have been stopped and removed (including orphans)
endlocal
exit /b 0


