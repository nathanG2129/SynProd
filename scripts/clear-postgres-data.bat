@echo off
REM DANGER: This script deletes all contents of data\postgres after explicit confirmation

setlocal enabledelayedexpansion

set POSTGRES_DIR=data\postgres

echo WARNING: You are about to permanently delete all contents under "%POSTGRES_DIR%".
echo This will erase your Postgres database files and cannot be undone.
echo.
set /p CONFIRM=Type YES to proceed (anything else to cancel): 

if /I not "%CONFIRM%"=="YES" (
    echo Operation cancelled.
    exit /b 0
)

REM Ensure directory exists
if not exist "%POSTGRES_DIR%" (
    echo Directory "%POSTGRES_DIR%" does not exist. Nothing to delete.
    exit /b 0
)

REM Check if any containers are using the files (optional: warn only)
echo Checking for running containers that might be using Postgres data...
cmd /c "docker ps -a | findstr /I postgres >nul 2>&1"
if not errorlevel 1 (
    echo Detected running containers that might be using the database.
    echo Please stop containers first by running scripts\down-containers.bat to avoid file locks.
)

echo Deleting contents of %POSTGRES_DIR% ...
REM Use pushd/popd and delete files then directories to avoid parsing issues
pushd "%POSTGRES_DIR%" >nul 2>&1
if errorlevel 1 (
    echo Failed to change directory to %POSTGRES_DIR%.
    exit /b 1
)

del /f /q * >nul 2>&1
for /d %%D in (*) do rd /s /q "%%D" >nul 2>&1

popd >nul 2>&1

echo Postgres data directory contents cleared.
endlocal
exit /b 0


