@echo off
REM ==============================================================================
REM OcuSphere Optical Retail - Local Deployment & Rebuild Script (Batch)
REM Runs directly on Windows without PowerShell Execution Policy restrictions
REM ==============================================================================

setlocal enabledelayedexpansion

echo ====================================================================
echo   OcuSphere Optical Retail -- Local Deployment and Rebuild (Batch)
echo ====================================================================

REM 1. Move to repository root directory
cd /d "%~dp0\.."
echo [INFO] Working directory: %CD%

REM 2. Git Pull
echo.
echo ==^> [1/5] Pulling latest repository changes...
if exist ".git" (
    git pull
) else (
    echo [INFO] No .git directory detected. Skipping git pull.
)

REM 3. Environment Configuration
echo.
echo ==^> [2/5] Configuring local environment (.env)...
if exist "deployment\.env.local" (
    copy /y "deployment\.env.local" ".env" >nul
    echo [INFO] Copied deployment\.env.local -^> .env
) else if exist "deployment\local.env" (
    copy /y "deployment\local.env" ".env" >nul
    echo [INFO] Copied deployment\local.env -^> .env
) else if not exist ".env" (
    if exist ".env.example" (
        copy /y ".env.example" ".env" >nul
        echo [INFO] Created .env from .env.example
    )
) else (
    echo [INFO] Existing .env retained.
)

REM 4. Docker Compose Down & Rebuild
echo.
echo ==^> [3/5] Stopping old containers and rebuilding images...
docker compose down --remove-orphans 2>nul
echo Running: docker compose build
docker compose build
if errorlevel 1 (
    echo [ERROR] Docker compose build failed.
    exit /b 1
)

echo.
echo ==^> [4/5] Launching containers in background...
docker compose up -d --remove-orphans
if errorlevel 1 (
    echo [ERROR] Docker compose up failed.
    exit /b 1
)

REM 5. Apply Prisma Migrations & Check Status
echo.
echo ==^> [5/5] Generating Prisma client and applying database migrations...
timeout /t 5 /nobreak >nul
docker compose exec -T backend npx prisma generate
docker compose exec -T backend npx prisma migrate deploy

echo.
echo Docker Compose Service Status:
docker compose ps

echo.
echo ====================================================================
echo   Local Deployment Complete! Services are operational:
echo ====================================================================
echo   * Storefront and POS Admin: http://localhost:3002
echo   * Backend API Health:       http://localhost:3005/api/v1/health
echo   * Swagger API Docs:         http://localhost:3005/api/docs
echo   * PostgreSQL Database:      localhost:5434 (db: ocusphere_optical)
echo ====================================================================
