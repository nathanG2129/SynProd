@echo off
REM Frontend build script for SynProd (Windows)
REM This script builds the frontend for production

setlocal enabledelayedexpansion

REM Configuration
set BUILD_DIR=dist\frontend

echo 🔨 SynProd Frontend Build
echo ========================

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

REM Check npm (skip version check as it can hang with fnm)
where npm >nul 2>&1
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

REM Build the frontend (skip cache to ensure fresh build)
echo 🔨 Building frontend...
npx nx build frontend --skip-nx-cache

REM Check if build was successful
if not exist "%BUILD_DIR%" (
    echo ❌ Frontend build failed! Build directory not found.
    exit /b 1
)

echo ✅ Frontend build completed successfully!
echo 📊 Build directory: %BUILD_DIR%

REM Show file sizes
echo 📈 Build size:
dir "%BUILD_DIR%" /S /-C | find "File(s)"

echo 🎉 Frontend is ready for deployment
echo 💡 Next step: Run copy-frontend.bat to copy files to nginx
