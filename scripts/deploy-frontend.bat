@echo off
REM Frontend deployment script for SynProd (Windows)
REM This script builds the frontend and prepares it for nginx serving

setlocal enabledelayedexpansion

REM Configuration
set BUILD_DIR=dist\frontend
set NGINX_DIR=nginx\html

echo 🚀 SynProd Frontend Deployment
echo =============================

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

echo ✅ Prerequisites check passed

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
) else (
    echo ✅ Dependencies already installed
)

REM Clean previous build
if exist "%BUILD_DIR%" (
    rmdir /s /q "%BUILD_DIR%"
    echo ✅ Cleaned previous frontend build
)

if exist "%NGINX_DIR%" (
    del /q "%NGINX_DIR%\*" 2>nul
    echo ✅ Cleaned nginx html directory
)

REM Build the frontend
echo 🔨 Building frontend...
npx nx build frontend

REM Check if build was successful
if not exist "%BUILD_DIR%" (
    echo ❌ Frontend build failed! Build directory not found.
    exit /b 1
)

REM Create nginx html directory
if not exist "%NGINX_DIR%" mkdir "%NGINX_DIR%"

REM Copy built files to nginx directory
echo 📋 Copying frontend files to nginx directory...
xcopy "%BUILD_DIR%\*" "%NGINX_DIR%\" /E /I /Y

REM Show build results
echo ✅ Frontend deployment completed successfully!
echo 📊 Build directory: %BUILD_DIR%
echo 📊 Nginx directory: %NGINX_DIR%

REM Show file sizes
echo 📈 Build size:
dir "%BUILD_DIR%" /S /-C | find "File(s)"

echo 🎉 Frontend is ready to be served by nginx
echo 💡 Next step: Run deploy-backend.bat to build the backend
