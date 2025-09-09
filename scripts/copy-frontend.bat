@echo off
REM Frontend copy script for SynProd (Windows)
REM This script copies the built frontend files to nginx directory

setlocal enabledelayedexpansion

REM Configuration
set BUILD_DIR=dist\frontend
set NGINX_DIR=nginx\html

echo 📋 SynProd Frontend Copy
echo =======================

REM Check if build directory exists
if not exist "%BUILD_DIR%" (
    echo ❌ Build directory not found: %BUILD_DIR%
    echo 💡 Please run build-frontend.bat first
    exit /b 1
)

echo ✅ Build directory found: %BUILD_DIR%

REM Clean nginx html directory
if exist "%NGINX_DIR%" (
    del /q "%NGINX_DIR%\*" 2>nul
    echo ✅ Cleaned nginx html directory
)

REM Create nginx html directory if it doesn't exist
if not exist "%NGINX_DIR%" (
    mkdir "%NGINX_DIR%"
    echo ✅ Created nginx html directory
)

REM Copy built files to nginx directory
echo 📋 Copying frontend files to nginx directory...
xcopy "%BUILD_DIR%\*" "%NGINX_DIR%\" /E /I /Y

REM Check if copy was successful
if not exist "%NGINX_DIR%\index.html" (
    echo ❌ Copy failed! index.html not found in nginx directory.
    exit /b 1
)

echo ✅ Frontend files copied successfully!
echo 📊 Build directory: %BUILD_DIR%
echo 📊 Nginx directory: %NGINX_DIR%

REM Show copied files
echo 📈 Copied files:
dir "%NGINX_DIR%" /B

echo 🎉 Frontend is ready to be served by nginx
echo 💡 Next step: Restart nginx container or run deploy-backend.bat
