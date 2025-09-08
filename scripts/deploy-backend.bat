@echo off
REM Backend deployment script for SynProd (Windows)
REM This script builds the backend and creates the Docker image

setlocal enabledelayedexpansion

REM Configuration
set BACKEND_DIR=backend
set IMAGE_NAME=synprod-backend
set IMAGE_TAG=latest
set FULL_IMAGE_NAME=%IMAGE_NAME%:%IMAGE_TAG%

echo 🚀 SynProd Backend Deployment
echo ============================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Please run this script from the project root directory
    exit /b 1
)

REM Check Java
java -version >nul 2>&1
if errorlevel 1 (
    echo ❌ Java is not installed. Please install Java 21 and try again.
    exit /b 1
)

REM Check Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker and try again.
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker and try again.
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Clean previous backend build
if exist "%BACKEND_DIR%\build" (
    rmdir /s /q "%BACKEND_DIR%\build"
    echo ✅ Cleaned previous backend build
)

REM Navigate to backend directory
cd "%BACKEND_DIR%"

REM Build backend
echo 🔨 Building backend...
echo   🔨 Running Gradle build...
gradlew.bat build -x test --no-daemon

REM Check if build was successful
dir build\libs\*.jar >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend build failed! JAR file not found.
    exit /b 1
)

echo ✅ Backend build completed

REM Return to root directory
cd ..

REM Build Docker image
echo 🐳 Building Docker image...
echo   🔨 Building backend Docker image...
docker build -t %FULL_IMAGE_NAME% ./backend

REM Check if Docker build was successful
docker images %FULL_IMAGE_NAME% >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker image build failed!
    exit /b 1
)

echo ✅ Docker image built successfully!

REM Show image information
echo 📊 Docker Image Information:
docker images %FULL_IMAGE_NAME% --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

echo 🎉 Backend deployment completed successfully!
echo 💡 Next step: Run start-containers.bat to start the services
