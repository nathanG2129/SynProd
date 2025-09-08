@echo off
REM Build script for SynProd backend Docker image (Windows)
REM This script builds the Spring Boot application Docker image for production

setlocal enabledelayedexpansion

REM Configuration
set IMAGE_NAME=synprod-backend
set IMAGE_TAG=latest
set FULL_IMAGE_NAME=%IMAGE_NAME%:%IMAGE_TAG%

echo 🚀 Building SynProd Backend Docker Image
echo Image: %FULL_IMAGE_NAME%

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Navigate to backend directory
cd /d "%~dp0..\backend"

REM Build the Docker image
echo 📦 Building Docker image...
docker build -t %FULL_IMAGE_NAME% .

REM Check if build was successful
if errorlevel 1 (
    echo ❌ Docker build failed!
    exit /b 1
)

echo ✅ Docker image built successfully!
echo Image: %FULL_IMAGE_NAME%

REM Show image size
echo 📊 Image size:
docker images %FULL_IMAGE_NAME% --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

REM Show image layers
echo 🔍 Image layers:
docker history %FULL_IMAGE_NAME% --format "table {{.CreatedBy}}\t{{.Size}}"

echo 🎉 Backend Docker image build completed successfully!
