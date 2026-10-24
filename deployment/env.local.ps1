# OcuSphere Optical Retail - Local Deployment and Rebuild Script for PowerShell

[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

Write-Host '====================================================================' -ForegroundColor Cyan
Write-Host '  OcuSphere Optical Retail - Local Deployment and Rebuild (PowerShell) ' -ForegroundColor Cyan
Write-Host '====================================================================' -ForegroundColor Cyan

# 1. Workspace root detection
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = (Resolve-Path "$ScriptDir/..").Path
Set-Location $ProjectRoot
Write-Host "[INFO] Working directory: $ProjectRoot" -ForegroundColor Green

# 2. Git Pull
Write-Host "`n==> [1/6] Pulling latest repository changes..." -ForegroundColor Yellow
if (Test-Path "$ProjectRoot/.git") {
    try {
        $branch = git rev-parse --abbrev-ref HEAD 2>$null
        Write-Host "    Current branch: $branch" -ForegroundColor Cyan
        git pull
        Write-Host '    Git pull successful.' -ForegroundColor Green
    } catch {
        Write-Host '    [WARN] Git pull encountered an issue. Proceeding with local files...' -ForegroundColor Yellow
    }
} else {
    Write-Host '    [INFO] No .git directory detected. Skipping git pull.' -ForegroundColor Yellow
}

# 3. Environment configuration
Write-Host "`n==> [2/6] Configuring local environment (.env)..." -ForegroundColor Yellow
if (Test-Path "$ScriptDir/.env.local") {
    Copy-Item -Path "$ScriptDir/.env.local" -Destination "$ProjectRoot/.env" -Force
    Write-Host '    Copied deployment/.env.local -> .env' -ForegroundColor Green
} elseif (Test-Path "$ScriptDir/local.env") {
    Copy-Item -Path "$ScriptDir/local.env" -Destination "$ProjectRoot/.env" -Force
    Write-Host '    Copied deployment/local.env -> .env' -ForegroundColor Green
} elseif (-not (Test-Path "$ProjectRoot/.env") -and (Test-Path "$ProjectRoot/.env.example")) {
    Copy-Item -Path "$ProjectRoot/.env.example" -Destination "$ProjectRoot/.env" -Force
    Write-Host '    Created .env from .env.example' -ForegroundColor Yellow
} else {
    Write-Host '    Existing .env retained.' -ForegroundColor Green
}

# 4. Docker Compose Down and Rebuild
Write-Host "`n==> [3/6] Stopping old containers and rebuilding Docker images..." -ForegroundColor Yellow
docker compose down --remove-orphans 2>$null

Write-Host '    Running: docker compose build' -ForegroundColor Cyan
docker compose build

Write-Host "`n==> [4/6] Starting containers in background..." -ForegroundColor Yellow
docker compose up -d --remove-orphans

# 5. Wait for PostgreSQL and Run Prisma
Write-Host "`n==> [5/6] Verifying database connectivity and Prisma schemas..." -ForegroundColor Yellow

$retries = 30
$count = 0
Write-Host '    Waiting for PostgreSQL container to become ready...' -NoNewline
while ($count -lt $retries) {
    $ready = docker compose exec -T postgres pg_isready 2>$null
    if ($LASTEXITCODE -eq 0) {
        break
    }
    Write-Host '.' -NoNewline
    Start-Sleep -Seconds 1
    $count++
}
Write-Host ''

if ($count -ge $retries) {
    Write-Host "    [ERROR] PostgreSQL timed out after $retries seconds." -ForegroundColor Red
    exit 1
}
Write-Host '    PostgreSQL is healthy and accepting connections.' -ForegroundColor Green

Write-Host '    Generating Prisma Client...' -ForegroundColor Cyan
docker compose exec -T backend npx prisma generate

Write-Host '    Applying Prisma migrations...' -ForegroundColor Cyan
try {
    docker compose exec -T backend npx prisma migrate deploy
} catch {
    Write-Host '    [INFO] Fallback to migrate dev...' -ForegroundColor Yellow
    docker compose exec -T backend npx prisma migrate dev --name auto_deploy
}

# 6. Service Health Status and Summary
Write-Host "`n==> [6/6] Docker Compose Service Status:" -ForegroundColor Yellow
docker compose ps

Write-Host "`n====================================================================" -ForegroundColor Green
Write-Host '  Local Deployment Complete! Services are operational:              ' -ForegroundColor Green
Write-Host '====================================================================' -ForegroundColor Green
Write-Host '  * Storefront and POS Admin: http://localhost:3002' -ForegroundColor Cyan
Write-Host '  * Backend API Health:       http://localhost:3005/api/v1/health' -ForegroundColor Cyan
Write-Host '  * Swagger API Docs:         http://localhost:3005/api/docs' -ForegroundColor Cyan
Write-Host '  * PostgreSQL Database:      localhost:5434 (db: ocusphere_optical)' -ForegroundColor Cyan
Write-Host '====================================================================' -ForegroundColor Green
