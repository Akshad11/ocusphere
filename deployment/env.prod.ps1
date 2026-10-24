# OcuSphere Optical Retail - Production Deployment and Rebuild Script for PowerShell

[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

Write-Host '====================================================================' -ForegroundColor Cyan
Write-Host '  OcuSphere Optical Retail - Production Deployment (PowerShell)      ' -ForegroundColor Cyan
Write-Host '====================================================================' -ForegroundColor Cyan

# 1. Determine Project Root Directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = (Resolve-Path "$ScriptDir/..").Path
Set-Location $ProjectRoot
Write-Host "[INFO] Working directory: $ProjectRoot" -ForegroundColor Green

# 2. Git Pull Latest Production Code
Write-Host "`n==> [1/7] Fetching latest production commits (git pull)..." -ForegroundColor Yellow
if (Test-Path "$ProjectRoot/.git") {
    try {
        $branch = git rev-parse --abbrev-ref HEAD 2>$null
        Write-Host "    Active branch: $branch" -ForegroundColor Cyan
        git pull origin $branch
        Write-Host '    Repository successfully updated.' -ForegroundColor Green
    } catch {
        Write-Host '    [WARN] Git pull encountered an issue. Proceeding with local state...' -ForegroundColor Yellow
    }
} else {
    Write-Host '    [INFO] No .git directory detected. Skipping git pull.' -ForegroundColor Yellow
}

# 3. Environment Configuration and Security Pre-check
Write-Host "`n==> [2/7] Preparing production environment configuration..." -ForegroundColor Yellow
$prodSource = $null
if (Test-Path "$ScriptDir/.env.prod") {
    $prodSource = "$ScriptDir/.env.prod"
} elseif (Test-Path "$ScriptDir/prod.env") {
    $prodSource = "$ScriptDir/prod.env"
}

if ($prodSource) {
    if (Test-Path "$ProjectRoot/.env") {
        $timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
        Copy-Item -Path "$ProjectRoot/.env" -Destination "$ProjectRoot/.env.backup.$timestamp" -Force
        Write-Host "    Backed up existing .env to .env.backup.$timestamp" -ForegroundColor Cyan
    }
    Copy-Item -Path $prodSource -Destination "$ProjectRoot/.env" -Force
    Write-Host "    Applied $prodSource -> .env" -ForegroundColor Green

    $envContent = Get-Content "$ProjectRoot/.env" -Raw
    if ($envContent -match 'CHANGE_ME') {
        Write-Host '    [SECURITY WARNING] Default placeholder credentials (CHANGE_ME) detected in .env!' -ForegroundColor Red
        Write-Host '    Please update POSTGRES_PASSWORD and JWT_SECRET in deployment/.env.prod for production safety.' -ForegroundColor Yellow
    }
} elseif (Test-Path "$ProjectRoot/.env") {
    Write-Host '    Using existing root .env file.' -ForegroundColor Green
} else {
    Write-Host '    [ERROR] Neither deployment/.env.prod nor .env exists.' -ForegroundColor Red
    exit 1
}

# 4. Pull Base Images and Docker Compose Rebuild
Write-Host "`n==> [3/7] Pulling upstream Docker base images..." -ForegroundColor Yellow
docker compose pull postgres 2>$null

Write-Host "`n==> [4/7] Stopping running containers and building clean production images..." -ForegroundColor Yellow
docker compose down --remove-orphans 2>$null

$composeArgs = @('-f', 'compose.yaml')
if (Test-Path "$ScriptDir/compose.prod.yaml") {
    $composeArgs += @('-f', "$ScriptDir/compose.prod.yaml")
    Write-Host '    Using production compose override: deployment/compose.prod.yaml' -ForegroundColor Cyan
}

Write-Host "    Executing: docker compose $composeArgs build --no-cache" -ForegroundColor Cyan
& docker compose @composeArgs build --no-cache

Write-Host "`n==> [5/7] Starting production containers..." -ForegroundColor Yellow
& docker compose @composeArgs up -d --remove-orphans

# 5. Wait for Database Readiness and Apply Prisma Migrations
Write-Host "`n==> [6/7] Verifying database connectivity and applying Prisma migrations..." -ForegroundColor Yellow

$retries = 40
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

Write-Host '    Executing production schema migrations...' -ForegroundColor Cyan
docker compose exec -T backend npx prisma migrate deploy

# 6. Cleanup and Status
Write-Host "`n==> [7/7] Pruning dangling Docker build layers..." -ForegroundColor Yellow
docker image prune -f 2>$null

Write-Host "`nDocker Compose Service Health:" -ForegroundColor Yellow
& docker compose @composeArgs ps

Write-Host "`n====================================================================" -ForegroundColor Green
Write-Host '  Production Deployment Complete! System is LIVE:                   ' -ForegroundColor Green
Write-Host '====================================================================' -ForegroundColor Green
Write-Host '  * Storefront and POS Ingress: http://localhost:80 (or configured PORT)' -ForegroundColor Cyan
Write-Host '  * Backend API Health:         http://localhost:3001/api/v1/health' -ForegroundColor Cyan
Write-Host '  * Active Profile:             production (target: runner)' -ForegroundColor Cyan
Write-Host '====================================================================' -ForegroundColor Green
