# OcuSphere Optical Retail — Deployment Automation

This directory contains automated deployment scripts and environment templates for **local development** and **production environments**. Both scripts automate repository synchronization (`git pull`), Docker Compose rebuilds, and Prisma database schema migrations.

---

## Directory Contents

| File | Purpose |
|---|---|
| [`env.local`](file:///g:/Coding/VS%20code/Optical%20Retail/deployment/env.local) | Bash deployment script for local development with hot-reloading |
| [`env.local.sh`](file:///g:/Coding/VS%20code/Optical%20Retail/deployment/env.local.sh) | Portable `.sh` wrapper for `env.local` |
| [`env.local.bat`](file:///g:/Coding/VS%20code/Optical%20Retail/deployment/env.local.bat) | Windows Batch script (No PowerShell ExecutionPolicy restrictions!) |
| [`env.local.ps1`](file:///g:/Coding/VS%20code/Optical%20Retail/deployment/env.local.ps1) | Native Windows PowerShell deployment script for local development |
| [`.env.local`](file:///g:/Coding/VS%20code/Optical%20Retail/deployment/.env.local) | Environment variable definitions for local development |
| [`env.prod`](file:///g:/Coding/VS%20code/Optical%20Retail/deployment/env.prod) | Hardened Bash deployment script for production releases |
| [`env.prod.sh`](file:///g:/Coding/VS%20code/Optical%20Retail/deployment/env.prod.sh) | Portable `.sh` wrapper for `env.prod` |
| [`env.prod.bat`](file:///g:/Coding/VS%20code/Optical%20Retail/deployment/env.prod.bat) | Windows Batch script (No PowerShell ExecutionPolicy restrictions!) |
| [`env.prod.ps1`](file:///g:/Coding/VS%20code/Optical%20Retail/deployment/env.prod.ps1) | Native Windows PowerShell deployment script for production releases |
| [`.env.prod`](file:///g:/Coding/VS%20code/Optical%20Retail/deployment/.env.prod) | Production environment variable template (database & JWT secrets) |
| [`compose.prod.yaml`](file:///g:/Coding/VS%20code/Optical%20Retail/deployment/compose.prod.yaml) | Docker Compose override targeting optimized `runner` images |

---

## 1. Quick Start

### Local Development Deployment

#### Option A: Windows Batch (Simplest on Windows — No Script Restriction)
```cmd
.\deployment\env.local.bat
```

#### Option B: Windows PowerShell (With ExecutionPolicy Bypass)
```powershell
powershell -ExecutionPolicy Bypass -File .\deployment\env.local.ps1
```
> Or enable script execution once: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

#### Option C: Linux / macOS / Git Bash / WSL
```bash
chmod +x deployment/env.local
./deployment/env.local
```

**What it executes:**
1. Checks for git repository and runs `git pull` on the active branch
2. Syncs `deployment/.env.local` to `.env`
3. Stops old containers: `docker compose down --remove-orphans`
4. Rebuilds containers: `docker compose build`
5. Starts services in background: `docker compose up -d`
6. Waits for PostgreSQL readiness: `pg_isready`
7. Generates Prisma client: `docker compose exec backend npx prisma generate`
8. Applies Prisma migrations: `docker compose exec backend npx prisma migrate deploy`
9. Displays container health table: `docker compose ps`

---

### Production Deployment

#### Option A: Windows Batch (Simplest on Windows — No Script Restriction)
```cmd
.\deployment\env.prod.bat
```

#### Option B: Windows PowerShell (With ExecutionPolicy Bypass)
```powershell
powershell -ExecutionPolicy Bypass -File .\deployment\env.prod.ps1
```

#### Option C: Linux / macOS / Git Bash / WSL
```bash
chmod +x deployment/env.prod
./deployment/env.prod
```

**What it executes:**
1. Runs `git pull origin <branch>` to fetch latest code
2. Backs up previous `.env` and applies `deployment/.env.prod`
3. Validates that placeholder credentials (`CHANGE_ME`) have been changed
4. Pulls upstream base images: `docker compose pull postgres`
5. Stops old containers: `docker compose down --remove-orphans`
6. Builds clean production images without cache:
   ```bash
   docker compose -f compose.yaml -f deployment/compose.prod.yaml build --no-cache
   ```
7. Launches production stack:
   ```bash
   docker compose -f compose.yaml -f deployment/compose.prod.yaml up -d --remove-orphans
   ```
8. Applies production schema migrations:
   ```bash
   docker compose exec backend npx prisma migrate deploy
   ```
9. Prunes dangling Docker build layers: `docker image prune -f`
10. Verifies container health: `docker compose ps`

---

## 2. Ports & Default Endpoints

| Environment | Service | URL / Port |
|---|---|---|
| **Local** | Web Storefront & POS Admin | `http://localhost:3002` |
| **Local** | Backend Health Check | `http://localhost:3005/api/v1/health` |
| **Local** | Swagger Documentation | `http://localhost:3005/api/docs` |
| **Local** | PostgreSQL Database | `localhost:5434` (db: `ocusphere_optical`) |
| **Production** | Web Storefront & POS Admin | `http://localhost:80` (or reverse proxy) |
| **Production** | Backend Health Check | `http://localhost:3001/api/v1/health` |
| **Production** | PostgreSQL Database | `localhost:5432` (db: `ocusphere_production`) |
