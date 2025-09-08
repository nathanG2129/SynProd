@echo off
REM Comprehensive build script for SynProd (Windows)
REM This script builds both frontend and backend for production deployment

setlocal enabledelayedexpansion

REM Configuration
set FRONTEND_DIR=frontend
set BACKEND_DIR=backend
set BUILD_DIR=dist
set NGINX_HTML_DIR=nginx\html

echo 🚀 SynProd Complete Build Process
echo =================================

REM Function to check prerequisites
:check_prerequisites
echo 🔍 Checking prerequisites...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Please run this script from the project root directory
    exit /b 1
)

REM Check Node.js
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

REM Check Java (for backend build)
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

echo ✅ All prerequisites are met
goto :clean_builds

REM Function to clean previous builds
:clean_builds
echo 🧹 Cleaning previous builds...

REM Clean frontend build
if exist "%BUILD_DIR%\frontend" (
    rmdir /s /q "%BUILD_DIR%\frontend"
    echo   ✓ Cleaned frontend build directory
)

REM Clean nginx html directory
if exist "%NGINX_HTML_DIR%" (
    del /q "%NGINX_HTML_DIR%\*" 2>nul
    echo   ✓ Cleaned nginx html directory
)

REM Clean backend build
if exist "%BACKEND_DIR%\build" (
    rmdir /s /q "%BACKEND_DIR%\build"
    echo   ✓ Cleaned backend build directory
)

echo ✅ Build cleanup completed
goto :install_dependencies

REM Function to install dependencies
:install_dependencies
echo 📦 Installing dependencies...

REM Install frontend dependencies
if not exist "node_modules" (
    echo   📦 Installing npm dependencies...
    npm install
) else (
    echo   ✓ Dependencies already installed
)

echo ✅ Dependencies installation completed
goto :build_frontend

REM Function to build frontend
:build_frontend
echo 🔨 Building frontend...

REM Build frontend
echo   🔨 Running nx build frontend...
npx nx build frontend

REM Check if build was successful
if not exist "%BUILD_DIR%\frontend" (
    echo ❌ Frontend build failed! Build directory not found.
    exit /b 1
)

REM Create nginx html directory
if not exist "%NGINX_HTML_DIR%" mkdir "%NGINX_HTML_DIR%"

REM Copy built files to nginx directory
echo   📋 Copying frontend files to nginx directory...
xcopy "%BUILD_DIR%\frontend\*" "%NGINX_HTML_DIR%\" /E /I /Y

echo ✅ Frontend build completed
goto :build_backend

REM Function to build backend
:build_backend
echo 🔨 Building backend...

REM Navigate to backend directory
cd "%BACKEND_DIR%"

REM Build backend
echo   🔨 Running Gradle build...
gradlew.bat build -x test --no-daemon

REM Check if build was successful
dir build\libs\*.jar >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend build failed! JAR file not found.
    exit /b 1
)

REM Return to root directory
cd ..

echo ✅ Backend build completed
goto :build_docker_images

REM Function to build Docker images
:build_docker_images
echo 🐳 Building Docker images...

REM Build backend Docker image
echo   🔨 Building backend Docker image...
docker build -t synprod-backend:latest ./backend

REM Build nginx Docker image
echo   🔨 Building nginx Docker image...
docker build -t synprod-nginx:latest ./nginx

echo ✅ Docker images built successfully
goto :show_build_summary

REM Function to show build summary
:show_build_summary
echo 🎉 Build process completed successfully!
echo =================================

REM Show frontend build size
if exist "%BUILD_DIR%\frontend" (
    echo 📊 Frontend build size:
    dir "%BUILD_DIR%\frontend" /S /-C | find "File(s)"
)

REM Show backend build size
if exist "%BACKEND_DIR%\build" (
    echo 📊 Backend build size:
    dir "%BACKEND_DIR%\build" /S /-C | find "File(s)"
)

REM Show Docker images
echo 🐳 Docker images:
docker images | findstr synprod

echo 📋 Next steps:
echo   1. Configure environment variables in .env.production
echo   2. Run deployment script: scripts\deploy-production.bat
echo   3. Or start services: docker-compose -f docker-compose.prod.yml up -d

goto :end

:end
echo Build process completed.
