@echo off
REM Build script for SynProd frontend (Windows)
REM This script builds the React frontend and prepares it for nginx serving

setlocal enabledelayedexpansion

REM Configuration
set FRONTEND_DIR=frontend
set BUILD_DIR=dist\frontend
set NGINX_DIR=nginx\html

echo 🚀 Building SynProd Frontend

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Please run this script from the project root directory
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js and try again.
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm and try again.
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
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
echo 📁 Preparing nginx directory...
if not exist "%NGINX_DIR%" mkdir "%NGINX_DIR%"

REM Copy built files to nginx directory
echo 📋 Copying files to nginx directory...
xcopy "%BUILD_DIR%\*" "%NGINX_DIR%\" /E /I /Y

REM Show build results
echo ✅ Frontend build completed successfully!
echo 📊 Build directory: %BUILD_DIR%
echo 📊 Nginx directory: %NGINX_DIR%

REM Show file sizes
echo 📈 Build size:
dir "%BUILD_DIR%" /S /-C | find "File(s)"

REM List main files
echo 📄 Main files:
dir "%BUILD_DIR%" /B | more

echo 🎉 Frontend build process completed successfully!
echo 💡 The frontend is now ready to be served by nginx
