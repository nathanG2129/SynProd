@echo off
REM Complete deployment script for SynProd (Windows)
REM This script builds frontend, backend, and starts production containers

echo 🚀 SynProd Complete Deployment
echo =============================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Please run this script from the project root directory
    exit /b 1
)

echo 📋 Starting complete SynProd deployment...
echo.

REM Step 1: Build Frontend
echo 🔨 Step 1: Building Frontend...
call scripts\build-frontend.bat
if errorlevel 1 (
    echo ❌ Frontend build failed!
    exit /b 1
)

echo.
echo ✅ Frontend build completed successfully!
echo.

REM Step 2: Copy Frontend to Nginx
echo 📋 Step 2: Copying Frontend to Nginx...
call scripts\copy-frontend.bat
if errorlevel 1 (
    echo ❌ Frontend copy failed!
    exit /b 1
)

echo.
echo ✅ Frontend deployment completed successfully!
echo.

REM Step 3: Build Backend
echo 🔨 Step 3: Building Backend...
call scripts\deploy-backend.bat
if errorlevel 1 (
    echo ❌ Backend build failed!
    exit /b 1
)

echo.
echo ✅ Backend build completed successfully!
echo.

REM Step 4: Start Production Containers
echo 🐳 Step 4: Starting Production Containers...
call scripts\start-containers.bat
if errorlevel 1 (
    echo ❌ Container startup failed!
    exit /b 1
)

echo.
echo 🎉 Complete SynProd deployment successful!
echo.
echo 📊 Deployment Summary:
echo    ✅ Frontend built and deployed to nginx
echo    ✅ Backend built and ready
echo    ✅ Production containers started
echo.
echo 🌐 Your application should now be available at:
echo    http://localhost (via nginx)
echo    http://localhost:8080 (direct backend access)
echo.
echo 💡 To view logs: docker-compose -f docker-compose.prod.yml logs -f
echo 💡 To stop: docker-compose -f docker-compose.prod.yml down
