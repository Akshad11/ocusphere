# OcuSphere — Contemporary Optical Retail Website, POS & Admin ERP

A modern, full-stack enterprise optical retail management platform inspired by premier eyewear shopping and clinical dispensing experiences (such as Lenskart). Engineered with a **React 19 + TypeScript + Tailwind CSS v4** storefront and admin dashboard, paired with a production-ready **NestJS + PostgreSQL + Prisma ORM** backend, completely containerized with Docker.

---

## 1. System Architecture

```mermaid
graph TD
    subgraph Client ["Client Presentation Tier (React 19 + Vite)"]
        Storefront["Public Storefront (/)\n- Eyewear Discovery\n- Refraction Exam Booking\n- Try-On Reservations\n- Coupon Validation"]
        AdminERP["Admin ERP & POS (/admin)\n- Point of Sale (POS)\n- Clinical Refraction Rx\n- Multi-Variant Inventory\n- Purchase Orders & GRN\n- Staff Roles & Audit Logs"]
    end

    subgraph Backend ["Application Tier (NestJS 10)"]
        Gateway["Global Route Prefix (/api/v1)\nSwagger Documentation (/api/docs)"]
        AuthModule["Auth & RBAC\n(Passport JWT + Argon2id)"]
        CatalogModule["Product Catalog\n(Cost Price Masking)"]
        InventoryModule["Inventory Engine\n(Atomic Transactions)"]
        POSModule["POS Billing & Returns\n(Decimal.js Precision)"]
        BookingModule["Bookings & Reservations\n(Hold & Auto-Release)"]
        PurchasingModule["Suppliers & POs\n(Duplicate-Safe GRN)"]
        ReportsModule["Reports & Analytics\n(Database Aggregation)"]
    end

    subgraph Data ["Data Tier (PostgreSQL 16)"]
        Postgres[(PostgreSQL Database\nNormalized Schema\nPrisma ORM)]
        NamedVol[(Named Docker Volume\nocusphere_postgres_data)]
    end

    Storefront -->|REST / JSON| Gateway
    AdminERP -->|REST / JWT Cookies| Gateway
    Gateway --> AuthModule
    Gateway --> CatalogModule
    Gateway --> InventoryModule
    Gateway --> POSModule
    Gateway --> BookingModule
    Gateway --> PurchasingModule
    Gateway --> ReportsModule
    Backend -->|Prisma Client| Postgres
    Postgres --> NamedVol
```

---

## 2. Technology Stack

| Layer | Technology | Key Libraries / Features |
|---|---|---|
| **Backend Framework** | **NestJS 10** | Modular architecture, Dependency Injection, Global Pipes, Guards, Filters, Interceptors |
| **Language** | **TypeScript 5.6** | Strict type-safety, Decorators, Generics |
| **Database & ORM** | **PostgreSQL 16** with **Prisma ORM 5.22** | Normalized schema, foreign key relations, unique SKU/barcodes, database transactions |
| **Security & Auth** | **Passport JWT** & **Argon2id** | HttpOnly cookies, Bearer tokens, CSRF-safe CORS, Helmet security headers |
| **Validation** | **class-validator** & **class-transformer** | Strict DTO validation with automatic type coercion |
| **Arithmetic** | **Decimal.js** | Decimal-safe calculations for retail GST, line item subtotals, discounts, and refunds |
| **API Documentation** | **Swagger / OpenAPI 3.0** | Interactive development documentation served at `/api/docs` |
| **Frontend UI** | **React 19** + **Vite 6** + **Tailwind CSS 4** | Dual-layout architecture, Lucide icons, responsive responsive design |
| **Containerization** | **Docker & Docker Compose** | Multi-stage Dockerfiles (`deps`, `dev`, `builder`, `runner`), healthchecks, zero host Node.js required |

---

## 3. Mandatory Docker-Only Workflow (Windows PowerShell)

No host-side Node.js or npm installation is needed on Windows. All database migrations, Prisma generation, seeding, testing, linting, and serving execute entirely inside Docker containers.

### Quick Start Commands

```powershell
# 1. Verify Docker Compose configuration
docker compose config

# 2. Build backend and frontend images
docker compose build

# 3. Launch database and backend in the background
docker compose up -d postgres backend

# 4. Check running service containers and health status
docker compose ps

# 5. Generate Prisma client inside container
docker compose exec backend npx prisma generate

# 6. Apply database schema migrations
docker compose exec backend npx prisma migrate dev --name init

# 7. Seed realistic retail mock data (>30 products, staff, customers, appointments)
docker compose exec backend npm run seed

# 8. Run unit and integration tests inside Docker
docker compose exec backend npm test

# 9. Launch the complete application (Frontend + Backend + PostgreSQL)
docker compose up -d

# 10. Follow backend application logs
docker compose logs -f backend

# 11. Shut down services safely (Persisting PostgreSQL volume)
docker compose down
```

> [!IMPORTANT]
> Never use `docker compose down -v` for routine operations, as `-v` destroys the persistent PostgreSQL named volume (`ocusphere_postgres_data`).

---

## 4. Environment Configuration

### Root `.env` / `.env.example`

| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `3002` | Frontend production web server port (Nginx) |
| `DEV_PORT` | `5173` | Frontend Vite HMR development port |
| `BACKEND_PORT` | `3005` | NestJS backend host port mapping (avoids port collisions) |
| `POSTGRES_PORT` | `5434` | PostgreSQL host port mapping (avoids standard 5432 collision) |
| `VITE_DATA_MODE` | `api` | Data mode toggle: `api` (live NestJS backend) or `mock` (in-memory demo) |
| `VITE_API_BASE_URL` | `http://localhost:3005/api/v1` | Public API base URL consumed by the client browser |
| `POSTGRES_USER` | `postgres` | Database superuser |
| `POSTGRES_PASSWORD` | `postgres` | Database password |
| `POSTGRES_DB` | `ocusphere_optical` | PostgreSQL database name |
| `DATABASE_URL` | `postgresql://postgres:postgres@postgres:5432/ocusphere_optical?schema=public` | Container internal connection string |
| `JWT_SECRET` | `ocusphere-super-secure-production-jwt-secret-key-2026` | Cryptographic secret for signing staff session tokens |
| `FRONTEND_ORIGIN` | `http://localhost:3000,http://localhost:3002,http://localhost:5173` | CORS allowed origins with credentials |

---

## 5. Seed Staff Personas & Credentials

All seeded staff users are provisioned with the initial password:
**`OcuSphere@2026`**

| Staff Member | Employee Code | Email | Role |
|---|---|---|---|
| **Rajiv Singhal** | `EMP-001` | `rajiv.singhal@ocusphere.in` | **Owner/Admin** (Full Authority) |
| **Kavita Joshi** | `EMP-002` | `kavita.joshi@ocusphere.in` | **Store Manager** (Operations, Inventory, Rx) |
| **Aman Patel** | `EMP-003` | `aman.patel@ocusphere.in` | **Cashier** (Point of Sale Billing) |
| **Karan Sharma** | `EMP-004` | `karan.sharma@ocusphere.in` | **Inventory Staff** (Receiving & Stocktakes) |
| **Simran Walia** | `EMP-005` | `simran.walia@ocusphere.in` | **Store Assistant** (Styling & Check-in) |

---

## 6. Testing & Concurrency Integrity

Comprehensive unit and integration test suites are included under `backend/src/**/*.spec.ts`:

- **Authentication & RBAC**: Verifies Argon2id password hashing, inactive account protection, and JWT issuance.
- **Product & Cost Price Security**: Tests that wholesale `costPrice` is masked from public responses and visible only to authorized managers.
- **Inventory Concurrency**: Validates atomic stock deduction, rejection of invalid negative inventory, and audit logging.
- **POS & Billing Calculations**: Verifies decimal-safe tax arithmetic, receipt generation, duplicate idempotency keys, and returns validation.
- **Reservation Holds**: Tests atomic inventory holds and automatic release when reservations are cancelled.
- **Purchasing & GRN**: Verifies partial goods receipts, prevention of over-receipts, and automatic PO status synchronization.

Run tests inside Docker:
```powershell
docker compose exec backend npm test
```

---

## 7. Known Limitations & Extensibility Roadmap

1. **SMS & WhatsApp Gateway**: Notifications are recorded in the PostgreSQL `notification_logs` table via a pluggable `NotificationProvider` interface. Integrating third-party providers (such as Twilio, Gupshup, or AWS SNS) requires configuring provider API keys.
2. **Card Terminal Integration**: The POS records in-store payment methods (Cash, Card Terminal, UPI QR) for accounting and receipt issuance without storing sensitive card numbers or CVVs.
3. **Multi-Store Franchising**: Current schema supports single-flagship retail operations. Future multi-location rollouts can add a `StoreBranch` tenant entity to partition inventory per warehouse.
#   o c u s p h e r e  
 