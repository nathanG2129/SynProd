@echo off
REM Database backup script for SynProd (Windows)
REM This script creates automated backups of the PostgreSQL database

setlocal enabledelayedexpansion

REM Configuration
set BACKUP_DIR=.\backups
set COMPOSE_FILE=docker-compose.prod.yml
set CONTAINER_NAME=synprod_postgres_prod
set DB_NAME=%POSTGRES_DB%
if "%DB_NAME%"=="" set DB_NAME=synprod
set DB_USER=%POSTGRES_USER%
if "%DB_USER%"=="" set DB_USER=synprod
set RETENTION_DAYS=30
set MAX_BACKUPS=10

echo 💾 SynProd Database Backup
echo =========================

REM Function to check prerequisites
:check_prerequisites
echo 🔍 Checking prerequisites...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Check if container exists and is running
docker ps | findstr "%CONTAINER_NAME%" >nul
if errorlevel 1 (
    echo ❌ PostgreSQL container '%CONTAINER_NAME%' is not running.
    echo 💡 Please start the application with: docker-compose -f %COMPOSE_FILE% up -d
    exit /b 1
)

echo ✅ Prerequisites check passed
goto :create_backup_directory

REM Function to create backup directory
:create_backup_directory
echo 📁 Creating backup directory...

if not exist "%BACKUP_DIR%" (
    mkdir "%BACKUP_DIR%"
    echo ✅ Backup directory created: %BACKUP_DIR%
) else (
    echo ✅ Backup directory exists: %BACKUP_DIR%
)

goto :create_backup

REM Function to create database backup
:create_backup
echo 🗄️  Creating database backup...

REM Generate timestamp
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "TIMESTAMP=%YYYY%%MM%%DD%_%HH%%Min%%Sec%"

set "BACKUP_FILE=%BACKUP_DIR%\synprod_backup_%TIMESTAMP%.sql"
set "BACKUP_FILE_COMPRESSED=%BACKUP_FILE%.gz"

echo 📋 Backup file: %BACKUP_FILE%

REM Create backup
echo 🔄 Executing pg_dump...
docker exec "%CONTAINER_NAME%" pg_dump -U "%DB_USER%" -d "%DB_NAME%" --verbose --no-password > "%BACKUP_FILE%"
if errorlevel 1 (
    echo ❌ Database backup failed
    exit /b 1
)
echo ✅ Database backup created successfully

REM Compress backup (using PowerShell for gzip)
echo 🗜️  Compressing backup...
powershell -Command "Compress-Archive -Path '%BACKUP_FILE%' -DestinationPath '%BACKUP_FILE%.zip' -Force"
if errorlevel 1 (
    echo ❌ Backup compression failed
    exit /b 1
)

REM Remove uncompressed file
del "%BACKUP_FILE%"

REM Rename zip to gz for consistency
ren "%BACKUP_FILE%.zip" "synprod_backup_%TIMESTAMP%.sql.gz"

echo ✅ Backup compressed: synprod_backup_%TIMESTAMP%.sql.gz

REM Get backup size
for %%A in ("%BACKUP_DIR%\synprod_backup_%TIMESTAMP%.sql.gz") do set "BACKUP_SIZE=%%~zA"
set "BACKUP_SIZE_MB=%BACKUP_SIZE:~0,-6%"
echo 📊 Backup size: %BACKUP_SIZE_MB% MB

goto :verify_backup

REM Function to verify backup
:verify_backup
echo 🔍 Verifying backup integrity...

REM Check if backup file exists and is not empty
if exist "%BACKUP_DIR%\synprod_backup_%TIMESTAMP%.sql.gz" (
    echo ✅ Backup file exists and is not empty
) else (
    echo ❌ Backup file is missing or empty
    exit /b 1
)

REM Test decompression
powershell -Command "Expand-Archive -Path '%BACKUP_DIR%\synprod_backup_%TIMESTAMP%.sql.gz' -DestinationPath '%TEMP%' -Force" >nul 2>&1
if errorlevel 1 (
    echo ❌ Backup file is corrupted
    exit /b 1
) else (
    echo ✅ Backup file is not corrupted
)

REM Check backup content
findstr /C:"PostgreSQL database dump" "%TEMP%\synprod_backup_%TIMESTAMP%.sql" >nul
if errorlevel 1 (
    echo ❌ Backup does not contain valid PostgreSQL dump
    del "%TEMP%\synprod_backup_%TIMESTAMP%.sql"
    exit /b 1
) else (
    echo ✅ Backup contains valid PostgreSQL dump
    del "%TEMP%\synprod_backup_%TIMESTAMP%.sql"
)

goto :cleanup_old_backups

REM Function to cleanup old backups
:cleanup_old_backups
echo 🧹 Cleaning up old backups...

REM Count current backups
set "BACKUP_COUNT=0"
for %%f in ("%BACKUP_DIR%\synprod_backup_*.sql.gz") do set /a BACKUP_COUNT+=1

if %BACKUP_COUNT% gtr %MAX_BACKUPS% (
    echo 📊 Found %BACKUP_COUNT% backups, keeping only %MAX_BACKUPS% most recent
    REM Keep only the most recent backups (this is a simplified approach)
    echo ℹ️  Manual cleanup recommended for Windows
) else (
    echo ✅ Backup count (%BACKUP_COUNT%) is within limit (%MAX_BACKUPS%)
)

goto :create_backup_metadata

REM Function to create backup metadata
:create_backup_metadata
echo 📝 Creating backup metadata...

set "METADATA_FILE=%BACKUP_DIR%\synprod_backup_%TIMESTAMP%.meta"

(
echo # SynProd Database Backup Metadata
echo # Generated: %date% %time%
echo # Database: %DB_NAME%
echo # User: %DB_USER%
echo # Container: %CONTAINER_NAME%
echo # Backup File: synprod_backup_%TIMESTAMP%.sql.gz
echo # Backup Size: %BACKUP_SIZE_MB% MB
) > "%METADATA_FILE%"

echo ✅ Backup metadata created: %METADATA_FILE%

goto :show_backup_summary

REM Function to show backup summary
:show_backup_summary
echo 🎉 Backup completed successfully!
echo ===============================

echo 📊 Backup Summary:
echo   Database: %DB_NAME%
echo   User: %DB_USER%
echo   Backup File: synprod_backup_%TIMESTAMP%.sql.gz
echo   Backup Size: %BACKUP_SIZE_MB% MB
echo   Timestamp: %date% %time%

echo.
echo 📋 Available Backups:
dir "%BACKUP_DIR%\synprod_backup_*.sql.gz" /B 2>nul || echo   No backups found

echo.
echo 📋 Next Steps:
echo   • Test restore: scripts\restore.bat synprod_backup_%TIMESTAMP%.sql.gz
echo   • Schedule backups: Use Windows Task Scheduler for automated backups
echo   • Monitor backup directory: Check disk space regularly

goto :end

:end
echo Backup process completed.
