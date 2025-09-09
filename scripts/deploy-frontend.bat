@echo off
REM Frontend deployment script for SynProd (Windows)
REM This script orchestrates the complete frontend deployment process

echo 🚀 SynProd Frontend Deployment
echo =============================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Please run this script from the project root directory
    exit /b 1
)

echo 📋 Starting complete frontend deployment...
echo.

REM Step 1: Build the frontend
echo 🔨 Step 1: Building frontend...
call scripts\build-frontend.bat
if errorlevel 1 (
    echo ❌ Frontend build failed!
    exit /b 1
)

echo.
echo ✅ Frontend build completed successfully!
echo.

REM Step 2: Copy files to nginx
echo 📋 Step 2: Copying files to nginx...
call scripts\copy-frontend.bat
if errorlevel 1 (
    echo ❌ Frontend copy failed!
    exit /b 1
)

echo.
echo 🎉 Frontend deployment completed successfully!
echo 💡 Next step: Run deploy-backend.bat to build the backend
