@echo off
REM Database restore script for SynProd (Windows)
REM This script restores the PostgreSQL database from a backup file

setlocal enabledelayedexpansion

REM Configuration
set COMPOSE_FILE=docker-compose.prod.yml
set CONTAINER_NAME=synprod_postgres_prod
set DB_NAME=%POSTGRES_DB%
if "%DB_NAME%"=="" set DB_NAME=synprod
set DB_USER=%POSTGRES_USER%
if "%DB_USER%"=="" set DB_USER=synprod

echo 🔄 SynProd Database Restore
echo =========================

REM Function to show usage
:show_usage
echo Usage: %0 ^<backup_file^> [options]
echo.
echo Arguments:
echo   backup_file    Path to the backup file (.sql or .sql.gz)
echo.
echo Options:
echo   --force        Skip confirmation prompt
echo   --dry-run      Show what would be restored without executing
echo   --help         Show this help message
echo.
echo Examples:
echo   %0 backups\synprod_backup_20240115_103000.sql.gz
echo   %0 backups\synprod_backup_20240115_103000.sql.gz --force
echo   %0 backups\synprod_backup_20240115_103000.sql.gz --dry-run
goto :end

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
goto :validate_backup_file

REM Function to validate backup file
:validate_backup_file
echo 🔍 Validating backup file...

REM Check if file exists
if not exist "%BACKUP_FILE%" (
    echo ❌ Backup file not found: %BACKUP_FILE%
    exit /b 1
)

REM Check if file is not empty
for %%A in ("%BACKUP_FILE%") do if %%~zA==0 (
    echo ❌ Backup file is empty: %BACKUP_FILE%
    exit /b 1
)

REM Check file type
echo %BACKUP_FILE% | findstr /i "\.gz$" >nul
if not errorlevel 1 (
    echo 🗜️  Detected compressed backup file
    echo ✅ Compressed backup file detected
) else (
    echo %BACKUP_FILE% | findstr /i "\.sql$" >nul
    if not errorlevel 1 (
        echo 📄 Detected SQL backup file
        echo ✅ SQL backup file detected
    ) else (
        echo ❌ Unsupported backup file format. Expected .sql or .sql.gz
        exit /b 1
    )
)

REM Get backup file size
for %%A in ("%BACKUP_FILE%") do set "BACKUP_SIZE=%%~zA"
set /a BACKUP_SIZE_MB=%BACKUP_SIZE%/1024/1024
echo 📊 Backup file size: %BACKUP_SIZE_MB% MB

goto :show_backup_info

REM Function to show backup information
:show_backup_info
echo 📋 Backup Information:
echo   File: %BACKUP_FILE%
echo   Size: %BACKUP_SIZE_MB% MB
echo   Modified: %~t1

REM Try to find metadata file
set "METADATA_FILE=%BACKUP_FILE:.sql.gz=.meta%"
set "METADATA_FILE=%METADATA_FILE:.sql=.meta%"
if exist "%METADATA_FILE%" (
    echo   Metadata: Available
    echo 📝 Backup Metadata:
    type "%METADATA_FILE%" | findstr /C:"# Database:" /C:"# User:" /C:"# Generated:" /C:"# PostgreSQL Version:" /C:"# Database Size:"
) else (
    echo   Metadata: Not available
)

goto :confirm_restore

REM Function to confirm restore operation
:confirm_restore
if "%FORCE%"=="true" goto :perform_restore

echo ⚠️  WARNING: This operation will overwrite the current database!
echo 📋 Restore Details:
echo   Target Database: %DB_NAME%
echo   Target User: %DB_USER%
echo   Backup File: %BACKUP_FILE%
echo   Container: %CONTAINER_NAME%
echo.
echo 💡 A pre-restore backup will be created automatically
echo.
set /p "confirm=Are you sure you want to proceed? (yes/no): "
if /i not "%confirm%"=="yes" (
    echo ℹ️  Restore operation cancelled
    goto :end
)

goto :perform_restore

REM Function to perform dry run
:perform_dry_run
echo 🔍 Performing dry run...

REM Show what would be restored
echo %BACKUP_FILE% | findstr /i "\.gz$" >nul
if not errorlevel 1 (
    echo 📋 Backup file contents (first 20 lines):
    powershell -Command "Expand-Archive -Path '%BACKUP_FILE%' -DestinationPath '%TEMP%' -Force; Get-Content '%TEMP%\*.sql' | Select-Object -First 20"
) else (
    echo 📋 Backup file contents (first 20 lines):
    type "%BACKUP_FILE%" | more +1 | findstr /n "^" | findstr "^[1-9][0-9]*:" | findstr "^[1-2][0-9]:"
)

echo.
echo ✅ Dry run completed. No changes were made to the database.
goto :end

REM Function to perform restore
:perform_restore
echo 🔄 Starting database restore...

REM Create pre-restore backup
echo 💾 Creating pre-restore backup...
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "TIMESTAMP=%YYYY%%MM%%DD%_%HH%%Min%%Sec%"

set "PRE_RESTORE_BACKUP=.\backups\pre_restore_%TIMESTAMP%.sql.gz"
docker exec "%CONTAINER_NAME%" pg_dump -U "%DB_USER%" -d "%DB_NAME%" --verbose --no-password | powershell -Command "Compress-Archive -Path - -DestinationPath '%PRE_RESTORE_BACKUP%' -Force"
if errorlevel 1 (
    echo ❌ Failed to create pre-restore backup
    exit /b 1
)
echo ✅ Pre-restore backup created: %PRE_RESTORE_BACKUP%

REM Stop application services
echo 🛑 Stopping application services...
docker-compose -f "%COMPOSE_FILE%" stop backend nginx 2>nul

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Drop and recreate database
echo 🗑️  Dropping existing database...
docker exec "%CONTAINER_NAME%" psql -U "%DB_USER%" -d postgres -c "DROP DATABASE IF EXISTS %DB_NAME%;"

echo 🆕 Creating new database...
docker exec "%CONTAINER_NAME%" psql -U "%DB_USER%" -d postgres -c "CREATE DATABASE %DB_NAME%;"

REM Restore database
echo 📥 Restoring database from backup...
echo %BACKUP_FILE% | findstr /i "\.gz$" >nul
if not errorlevel 1 (
    powershell -Command "Expand-Archive -Path '%BACKUP_FILE%' -DestinationPath '%TEMP%' -Force; Get-Content '%TEMP%\*.sql' | docker exec -i '%CONTAINER_NAME%' psql -U '%DB_USER%' -d '%DB_NAME%' --verbose"
    if errorlevel 1 (
        echo ❌ Database restore failed
        exit /b 1
    )
    echo ✅ Database restored successfully from compressed backup
) else (
    docker exec -i "%CONTAINER_NAME%" psql -U "%DB_USER%" -d "%DB_NAME%" --verbose < "%BACKUP_FILE%"
    if errorlevel 1 (
        echo ❌ Database restore failed
        exit /b 1
    )
    echo ✅ Database restored successfully from SQL backup
)

REM Start application services
echo 🚀 Starting application services...
docker-compose -f "%COMPOSE_FILE%" start backend nginx

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Verify restore
call :verify_restore
goto :show_restore_summary

REM Function to verify restore
:verify_restore
echo 🔍 Verifying restore...

REM Check if database is accessible
docker exec "%CONTAINER_NAME%" psql -U "%DB_USER%" -d "%DB_NAME%" -c "SELECT 1;" >nul 2>&1
if errorlevel 1 (
    echo ❌ Database is not accessible
    exit /b 1
)
echo ✅ Database is accessible

REM Check table count
for /f %%i in ('docker exec "%CONTAINER_NAME%" psql -U "%DB_USER%" -d "%DB_NAME%" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"') do set "TABLE_COUNT=%%i"
set "TABLE_COUNT=%TABLE_COUNT: =%"
echo 📊 Tables restored: %TABLE_COUNT%

REM Check if backend is responding
echo 🔍 Checking backend health...
curl -f http://localhost:8080/actuator/health >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Backend is not responding yet (may need more time to start)
) else (
    echo ✅ Backend is responding
)
goto :eof

REM Function to show restore summary
:show_restore_summary
echo 🎉 Database restore completed successfully!
echo =====================================

echo 📊 Restore Summary:
echo   Database: %DB_NAME%
echo   User: %DB_USER%
echo   Backup File: %BACKUP_FILE%
echo   Tables Restored: %TABLE_COUNT%
echo   Timestamp: %date% %time%

echo.
echo 📋 Next Steps:
echo   • Verify application functionality
echo   • Check data integrity
echo   • Monitor application logs
echo   • Test critical business functions

echo.
echo 💡 Recovery Information:
echo   • Pre-restore backup available in .\backups\
echo   • Use restore script to revert if needed
echo   • Monitor application for any issues

goto :end

REM Main function
set "BACKUP_FILE="
set "FORCE=false"
set "DRY_RUN=false"

REM Parse arguments
:parse_args
if "%~1"=="" goto :check_backup_file
if "%~1"=="--force" (
    set "FORCE=true"
    shift
    goto :parse_args
)
if "%~1"=="--dry-run" (
    set "DRY_RUN=true"
    shift
    goto :parse_args
)
if "%~1"=="--help" (
    call :show_usage
    goto :end
)
if "%~1"=~-* (
    echo ❌ Unknown option: %~1
    call :show_usage
    exit /b 1
)
if "%BACKUP_FILE%"=="" (
    set "BACKUP_FILE=%~1"
    shift
    goto :parse_args
) else (
    echo ❌ Multiple backup files specified
    call :show_usage
    exit /b 1
)

:check_backup_file
if "%BACKUP_FILE%"=="" (
    echo ❌ Backup file is required
    call :show_usage
    exit /b 1
)

REM Check prerequisites
call :check_prerequisites

REM Validate backup file
call :validate_backup_file

REM Show backup information
call :show_backup_info

REM Perform dry run if requested
if "%DRY_RUN%"=="true" (
    call :perform_dry_run
    goto :end
)

REM Confirm restore unless forced
if "%FORCE%"=="false" (
    call :confirm_restore
)

REM Perform restore
call :perform_restore

REM Show summary
call :show_restore_summary

:end
echo Restore process completed.
