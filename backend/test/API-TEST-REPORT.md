# OcuSphere Optical Retail: Complete Backend API Testing, Admin Debugging & System Verification Report

**Date of Execution:** October 25, 2026  
**Environment:** Docker on Windows (Containers: `ocusphere-backend`, `ocusphere-optical-retail`, `ocusphere-postgres`)  
**Primary Database:** `ocusphere_optical` (PostgreSQL 16)  
**Isolated Test Database:** `ocusphere_optical_test` (PostgreSQL 16, schema synchronized via Prisma)  
**Base URL:** `http://localhost:3005/api/v1` (internal `http://backend:3001/api/v1`)  
**Frontend URL:** `http://localhost:3002` (internal `http://app:80`)  

---

## 1. Executive Summary

```text
============================================================
                     API TEST SUMMARY
============================================================
Total discovered endpoints:  76
Endpoints tested:            76
Passed tests:                146 (E2E) + 21 (Unit) = 167 total
Failed tests:                0
Skipped tests:               0
Missing endpoints:           0

Admin login:                 PASS
Admin authorization:         PASS
Admin dashboard:             PASS
Admin module workflows:      PASS
Database connectivity:       PASS
Backend build:               PASS
Docker startup:              PASS
============================================================
```

All 76 backend endpoints across 11 functional domains have been discovered, catalogued in `backend/test/api-inventory.md`, and comprehensively tested with automated test suites running inside Docker against an isolated test database. 

Furthermore, full-stack integration issues with the Admin Panel were diagnosed and resolved:
1. Created the missing Admin Login page (`/admin/login`) with credential validation, role presets, and secure token persistence.
2. Protected `/admin/*` routes against unauthenticated access.
3. Corrected frontend fallback API host port mapping (`3005`).
4. Reconciled interface mismatches in `ApiReportService`, `ApiInventoryService`, `ApiPurchaseOrderService`, `ApiStaffService`, and `ApiNotificationService` so that the Admin Panel seamlessly operates in live API mode.

---

## 2. Discovered Services & Endpoints Inventory

The backend is built with NestJS, Prisma ORM, and PostgreSQL. Every registered route was extracted and verified:

| Module Domain | Controller / Base Route | Endpoint Count | Public Routes | Protected Routes | E2E Test Suite | Result |
|---------------|--------------------------|----------------|---------------|------------------|----------------|--------|
| **1. Authentication & Sessions** | `/api/v1/auth` | 4 | 1 | 3 | `auth.e2e-spec.ts` | **PASS (10/10)** |
| **2. Staff & RBAC Permissions** | `/api/v1/staff`, `/roles` | 6 | 0 | 6 | `users.e2e-spec.ts` | **PASS (12/12)** |
| **3. Products, Categories & Brands** | `/api/v1/products`, `/categories`, `/brands` | 10 | 6 | 4 | `products.e2e-spec.ts` | **PASS (13/13)** |
| **4. Inventory, Adjustments & Counts** | `/api/v1/inventory` | 10 | 0 | 10 | `inventory.e2e-spec.ts` | **PASS (16/16)** |
| **5. Customers & Clinical Rx** | `/api/v1/customers` | 7 | 0 | 7 | `customers.e2e-spec.ts` | **PASS (12/12)** |
| **6. Appointments & Reservations** | `/api/v1/bookings`, `/reservations` | 6 | 3 | 3 | `bookings.e2e-spec.ts` | **PASS (10/10)** |
| **7. POS Checkout & Sales** | `/api/v1/sales` | 4 | 0 | 4 | `sales.e2e-spec.ts` | **PASS (12/12)** |
| **8. Returns & Customer Refunds** | `/api/v1/sales/:id/returns`, `/returns` | 2 | 0 | 2 | `returns.e2e-spec.ts` | **PASS (7/7)** |
| **9. Optical Suppliers & Labs** | `/api/v1/suppliers` | 4 | 0 | 4 | `suppliers.e2e-spec.ts` | **PASS (8/8)** |
| **10. Purchase Orders** | `/api/v1/purchase-orders` | 4 | 0 | 4 | `purchase-orders.e2e-spec.ts` | **PASS (9/9)** |
| **11. Goods Receipts & Inwarding** | `/api/v1/goods-receipts` | 3 | 0 | 3 | `goods-receipts.e2e-spec.ts` | **PASS (10/10)** |
| **12. Offers & Promotional Coupons** | `/api/v1/offers`, `/coupons` | 6 | 3 | 3 | `coupons.e2e-spec.ts` | **PASS (12/12)** |
| **13. Reports & Retail KPIs** | `/api/v1/reports` | 3 | 0 | 3 | `reports.e2e-spec.ts` | **PASS (5/5)** |
| **14. Notifications, Settings, Audit & Health** | `/api/v1/notifications`, `/settings`, `/audit-logs`, `/health` | 7 | 2 | 5 | `admin-access.e2e-spec.ts` | **PASS (10/10)** |
| **TOTAL** | — | **76** | **16** | **60** | **14 Suites** | **PASS (146/146)** |

---

## 3. Automated Test Suite Architecture

All test files are organized under `backend/test/` with modular separation:

```text
backend/test/
├── api-inventory.md                  # Comprehensive 76-route endpoint inventory
├── API-TEST-REPORT.md                # This QA report
├── jest-e2e.json                     # E2E test configuration with TypeScript mapping
├── setup/
│   ├── test-app.ts                   # Global NestJS context, ValidationPipe, CookieParser, and RBAC token harness
│   └── fixtures.ts                   # Realistic eyewear, customer, and prescription test data
├── auth.e2e-spec.ts                  # 10 tests: login, session cookies, /auth/me, password change, logout
├── users.e2e-spec.ts                 # 12 tests: staff CRUD, role restrictions, self-deactivation protection
├── products.e2e-spec.ts              # 13 tests: catalog search, slug lookup, SKU uniqueness, soft deletion
├── inventory.e2e-spec.ts             # 16 tests: stock balances, adjustments, movements ledger, counts, requests
├── customers.e2e-spec.ts             # 12 tests: customer CRUD, privacy masking, prescriptions, history
├── bookings.e2e-spec.ts              # 10 tests: optometry appointments, trial holds, cancellations
├── sales.e2e-spec.ts                 # 12 tests: POS billing, tax calculations, stock deduction, idempotency
├── returns.e2e-spec.ts               # 7 tests: partial/full returns, refund calculation, inventory restock
├── suppliers.e2e-spec.ts             # 8 tests: vendor profiles, payment terms, purchase order association
├── purchase-orders.e2e-spec.ts       # 9 tests: PO creation, line item costs, submission lifecycle
├── goods-receipts.e2e-spec.ts        # 10 tests: shipment inwarding, partial receipts, atomic stock increments
├── coupons.e2e-spec.ts               # 12 tests: promotional campaigns, validation, discount logic, POS redemption
├── reports.e2e-spec.ts               # 5 tests: executive dashboard KPIs, sales breakdown, inventory valuation
└── admin-access.e2e-spec.ts          # 10 tests: system settings, notifications retry, audit trail, health probe
```

---

## 4. Root Causes, Bugs Discovered & Fixes Applied

During rigorous testing and investigation, 9 distinct root-cause bugs were discovered and resolved:

### 1. Admin Authentication Missing from Frontend
- **Symptom:** Opening `/admin` rendered the admin layout directly without requiring an authenticated session, but API calls failed with `401 Unauthorized` because no JWT was stored. Navigating to `/admin/login` redirected to the public home page.
- **Root Cause:** `frontend/src/app/AppRoutes.tsx` had no `/admin/login` route defined, and `frontend/src/layouts/AdminLayout.tsx` lacked authentication verification guards.
- **Fix:** 
  1. Created `frontend/src/pages/admin/AdminLoginPage.tsx` with credential inputs, quick demo account presets, error alerts, and JWT persistence in `localStorage` and `apiClient`.
  2. Registered `/admin/login` in `frontend/src/app/AppRoutes.tsx`.
  3. Added an authentication check in `frontend/src/layouts/AdminLayout.tsx` redirecting unauthenticated users to `/admin/login`.
  4. Added a Sign Out button in `AdminHeader.tsx` triggering backend `/auth/logout` and session clearing.

### 2. Frontend API Port Mismatch
- **Symptom:** In local and Docker browser environments, API requests failed to connect.
- **Root Cause:** `frontend/src/services/apiClient.ts` defaulted to `http://localhost:3001/api/v1`. While the backend container listens on port 3001 internally, `compose.yaml` maps it to host port `3005:3001`. Browser requests originated from the host machine where port 3001 was closed.
- **Fix:** Changed default fallback URL in `frontend/src/services/apiClient.ts` to `http://localhost:3005/api/v1`.

### 3. Missing Methods & Interface Mismatches in `apiServices.ts`
- **Symptom:** Switching from mock mode to API mode (`VITE_DATA_MODE=api`) caused runtime crashes across multiple Admin views (`DashboardPage`, `ReportsPage`, `StocktakesPage`, `PurchaseOrderDetailsPage`, `StoreSettingsPage`).
- **Root Causes:**
  - `ApiReportService` lacked `getSalesSummary()` and `getBookingStats()`.
  - `ApiInventoryService` used different method names (`list` vs `listStock`, `listMovements` vs `getMovements`, `listStockRequests` vs `getStockRequests`, `listStocktakes` vs `getStocktakes`).
  - `ApiPurchaseOrderService` lacked `confirmGoodsReceipt()`.
  - `ApiStaffService` lacked `getStaffById()`, `getRoles()`, `getSettings()`, `updateSettings()`, and `listAuditLogs()`.
  - `ApiNotificationService` was completely unimplemented, and `mockNotificationService.ts` did not support the API mode toggle.
- **Fix:** Updated `frontend/src/services/apiServices.ts` and `mockNotificationService.ts` to implement all required interface methods, translating backend JSON responses into the exact types expected by Admin components.

### 4. Foreign Key Violation on Product Deletion
- **Symptom:** `DELETE /api/v1/products/:id` failed with `500 Internal Server Error` (`Foreign key constraint violated: stock_movements_variantId_fkey`).
- **Root Cause:** `products.service.ts` only checked for linked `saleItem` records. Variants with initial stock create `stockMovement` records upon creation, preventing SQL hard deletion.
- **Fix:** Modified `products.service.ts` to check linked `saleItem`, `stockMovement`, and `purchaseOrderItem` records. If any exist, it soft-archives the product (`status: 'archived'`), preserving transactional audit integrity.

### 5. Staff Self-Deactivation Security Hole
- **Symptom:** An authenticated administrator could deactivate their own account via `DELETE /api/v1/staff/:id`, causing an irreversible lockout.
- **Root Cause:** `staff.controller.ts` did not compare the targeted `:id` against the authenticated `@CurrentUser('id')`.
- **Fix:** Added validation in `staff.controller.ts` and `staff.service.ts` rejecting self-deactivation with `400 Bad Request`.

### 6. Non-Partial Update DTO on Suppliers
- **Symptom:** `PATCH /api/v1/suppliers/:id` rejected partial updates with `400 Bad Request` unless all required creation fields (`businessName`, `contactPerson`, `taxId`, etc.) were resubmitted.
- **Root Cause:** `UpdateSupplierDto` was defined as `class UpdateSupplierDto extends CreateSupplierDto {}` instead of `PartialType(CreateSupplierDto)`.
- **Fix:** Updated `backend/src/suppliers/dto/create-supplier.dto.ts` to extend `PartialType(CreateSupplierDto)`.

### 7. Missing Schema Fields in Store Settings Upsert
- **Symptom:** `PATCH /api/v1/settings` failed with `500 Internal Server Error` (`PrismaClientValidationError: Argument address is missing`).
- **Root Cause:** `settings.service.ts` passed partial `updateData` into the `create` branch of `this.prisma.storeSetting.upsert({ where: { id: 'default' } })`.
- **Fix:** Provided comprehensive default values for required schema fields (`storeName`, `tagline`, `address`, `phone`, `email`, `gstin`, `openingHours`, etc.) in the `create` branch.

### 8. Unhandled Error Thrown in Notifications Service
- **Symptom:** Calling `POST /api/v1/notifications/:id/retry` with a non-existent ID resulted in `500 Internal Server Error` instead of `404 Not Found`.
- **Root Cause:** `notifications.service.ts` threw a raw `new Error(...)` instead of NestJS `NotFoundException`.
- **Fix:** Replaced with `throw new NotFoundException(...)`.

### 9. Test DB Seed Idempotency & Concurrency Races
- **Symptom:** Re-running tests failed when seeding due to unique constraint violations (`P2002`) on `Coupon` (`FESTIVE15`), and password changes in `auth.e2e-spec.ts` disrupted concurrent logins.
- **Root Causes:**
  - `prisma/seed.ts` lacked existence checks before creating coupons and bookings.
  - Multi-worker Jest execution mutated shared user credentials concurrently.
- **Fix:**
  - Added existence guards in `seed.ts` and ensured user upsert resets default passwords.
  - Configured `backend/package.json` with `"test:e2e": "jest --config ./test/jest-e2e.json --runInBand"`.
  - Isolated password update tests in `auth.e2e-spec.ts` using temporary dynamic test accounts.

---

## 5. Security & RBAC Verification Findings

1. **Authentication Token Verification:**
   - JWT tokens generated by `/auth/login` include `sub` (userId), `email`, `role`, and `fullName`.
   - Both HTTP-only cookies (`ocusphere_access_token`) and `Authorization: Bearer <token>` headers are supported and verified.
   - Password hashes (`argon2id`) are strictly excluded from all user and staff API responses.
2. **Role-Based Access Control (RBAC):**
   - Endpoints protected with `@RequirePermissions(...)` enforce least-privilege access:
     - `CASHIER` is granted `pos_access` but forbidden from `manage_staff`, `store_settings`, `manage_purchase_orders`, and `adjust_inventory` (`403 Forbidden`).
     - `INVENTORY_STAFF` is granted `adjust_inventory` but forbidden from `pos_access` (`403 Forbidden`).
     - `OWNER_ADMIN` and `STORE_MANAGER` have access to administrative and managerial controls.
3. **Data Protection & Prescription Privacy:**
   - General staff without `view_prescriptions` receive masked optical prescription records.
   - Public storefront endpoints expose only published product information, store settings, and active promotions without leaking internal financial costs.

---

## 6. How to Run the Application & Automated Tests

All operations run inside Docker on Windows.

### Start the Docker Services

```powershell
docker compose up -d
```

Verify service health:

```powershell
docker compose ps
```

Expected output:
- `ocusphere-backend`: Up (healthy) on `0.0.0.0:3005->3001/tcp`
- `ocusphere-optical-retail`: Up (healthy) on `0.0.0.0:3002->80/tcp`
- `ocusphere-postgres`: Up (healthy) on `0.0.0.0:5434->5432/tcp`

### Run Backend Unit Tests

```powershell
docker compose exec backend npm test
```

### Run Full Automated E2E API Test Suite

```powershell
docker compose exec -e DATABASE_URL="postgresql://postgres:postgres@postgres:5432/ocusphere_optical_test?schema=public" backend npm run test:e2e
```

### Run an Individual Module Test

```powershell
docker compose exec -e DATABASE_URL="postgresql://postgres:postgres@postgres:5432/ocusphere_optical_test?schema=public" backend npm run test:e2e -- test/auth.e2e-spec.ts
docker compose exec -e DATABASE_URL="postgresql://postgres:postgres@postgres:5432/ocusphere_optical_test?schema=public" backend npm run test:e2e -- test/sales.e2e-spec.ts
docker compose exec -e DATABASE_URL="postgresql://postgres:postgres@postgres:5432/ocusphere_optical_test?schema=public" backend npm run test:e2e -- test/admin-access.e2e-spec.ts
```

### Verify Backend TypeScript Compilation

```powershell
docker compose exec backend npm run build
```

### Verify Frontend Production Build

```powershell
docker compose build app
docker compose up -d --no-deps app
```

---

## 7. Accessing the Application

- **Storefront Customer Portal:** `http://localhost:3002`
- **Admin Retail Portal & POS:** `http://localhost:3002/admin/login`
  - **Admin Credentials:** `rajiv.singhal@ocusphere.in` / `OcuSphere@2026`
  - **Manager Credentials:** `kavita.joshi@ocusphere.in` / `OcuSphere@2026`
  - **Cashier Credentials:** `aman.patel@ocusphere.in` / `OcuSphere@2026`
  - **Inventory Staff:** `karan.sharma@ocusphere.in` / `OcuSphere@2026`
- **Backend Swagger API Documentation:** `http://localhost:3005/api/docs`
- **Backend Health Check:** `http://localhost:3005/api/v1/health`
