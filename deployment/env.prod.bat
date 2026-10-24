@echo off
REM ==============================================================================
REM OcuSphere Optical Retail - Production Deployment Script (Batch)
REM Runs directly on Windows without PowerShell Execution Policy restrictions
REM ==============================================================================

setlocal enabledelayedexpansion

echo ====================================================================
echo   OcuSphere Optical Retail -- Production Deployment (Batch)
echo ====================================================================

REM 1. Move to repository root directory
cd /d "%~dp0\.."
echo [INFO] Working directory: %CD%

REM 2. Git Pull Latest Production Code
echo.
echo ==^> [1/6] Fetching latest production commits (git pull)...
if exist ".git" (
    git pull
) else (
    echo [INFO] No .git directory detected. Skipping git pull.
)

REM 3. Production Environment Configuration
echo.
echo ==^> [2/6] Preparing production environment configuration...
if exist "deployment\.env.prod" (
    if exist ".env" (
        copy /y ".env" ".env.backup" >nul
        echo [INFO] Backed up current .env to .env.backup
    )
    copy /y "deployment\.env.prod" ".env" >nul
    echo [INFO] Applied deployment\.env.prod -^> .env
) else if exist "deployment\prod.env" (
    if exist ".env" (
        copy /y ".env" ".env.backup" >nul
        echo [INFO] Backed up current .env to .env.backup
    )
    copy /y "deployment\prod.env" ".env" >nul
    echo [INFO] Applied deployment\prod.env -^> .env
) else if not exist ".env" (
    echo [ERROR] Neither deployment\.env.prod nor .env exists.
    exit /b 1
)

REM 4. Pull Base Images and Clean Rebuild
echo.
echo ==^> [3/6] Pulling upstream Docker base images...
docker compose pull postgres 2>nul

echo.
echo ==^> [4/6] Stopping running containers and building clean production images...
docker compose down --remove-orphans 2>nul

set COMPOSE_FILES=-f compose.yaml
if exist "deployment\compose.prod.yaml" (
    set COMPOSE_FILES=-f compose.yaml -f deployment\compose.prod.yaml
    echo [INFO] Using production compose override: deployment\compose.prod.yaml
)

echo Running: docker compose %COMPOSE_FILES% build --no-cache
docker compose %COMPOSE_FILES% build --no-cache
if errorlevel 1 (
    echo [ERROR] Docker compose production build failed.
    exit /b 1
)

echo.
echo ==^> [5/6] Launching production containers...
docker compose %COMPOSE_FILES% up -d --remove-orphans
if errorlevel 1 (
    echo [ERROR] Docker compose up failed.
    exit /b 1
)

REM 5. Apply Database Migrations & Cleanup
echo.
echo ==^> [6/6] Applying Prisma migrations...
timeout /t 5 /nobreak >nul
docker compose exec -T backend npx prisma migrate deploy

docker image prune -f 2>nul

echo.
echo Docker Compose Service Health:
docker compose %COMPOSE_FILES% ps

echo.
echo ====================================================================
echo   Production Deployment Complete! System is LIVE:
echo ====================================================================
echo   * Storefront and POS Ingress: http://localhost:80 (or configured PORT)
echo   * Backend API Health:         http://localhost:3001/api/v1/health
echo   * Active Profile:             production (target: runner)
echo ====================================================================
