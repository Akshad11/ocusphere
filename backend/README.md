# OcuSphere Optical Retail Backend

Production-ready NestJS backend engineered for contemporary optical retail management, Point of Sale (POS) dispensing, multi-variant frame & ophthalmic lens inventory, optometric appointment bookings, in-store product reservations, vendor purchase orders, goods receipts, and role-based staff administration.

---

## 1. Architectural Highlights

- **Framework**: NestJS 10 (Node.js LTS, Express platform).
- **Language**: TypeScript with strict typing.
- **Database & ORM**: PostgreSQL with Prisma ORM.
- **Security & Hashing**: Passport JWT authentication, Argon2id password hashing, and fine-grained server-side Role-Based Access Control (RBAC).
- **Monetary Integrity**: High-precision `Decimal.js` calculations for line items, discounts, GST taxes, and refund totals.
- **Concurrency & Transactions**: Database transactions (`prisma.$transaction`) with atomic stock holds and release locks to prevent double-selling and overselling.
- **Global API Standards**:
  - Base Prefix: `/api/v1`
  - Swagger OpenAPI Documentation: `/api/docs`
  - Global Exception Filter: Standard error schema (`{ success: false, error: { code, message, details } }`) with sensitive SQL and password masking.
  - Transform Interceptor: Standard success schema (`{ success: true, data: ..., meta: ... }`).
  - Correlation ID Interceptor: Tracks every request via `X-Correlation-Id`.
  - Rate Limiting: Global Throttler guard protecting auth and booking endpoints.

---

## 2. Directory Structure

```text
backend/
├── src/
│   ├── main.ts                       # Application entrypoint (Helmet, CORS, Swagger, Validation)
│   ├── app.module.ts                 # Root module with global guards & filters
│   ├── common/
│   │   ├── constants/                # Permission keys and default role matrices
│   │   ├── decorators/               # @Public, @CurrentUser, @RequirePermissions, @Roles
│   │   ├── filters/                  # GlobalExceptionFilter
│   │   ├── guards/                   # JwtAuthGuard, RolesGuard, PermissionsGuard
│   │   └── interceptors/             # TransformInterceptor, CorrelationIdInterceptor
│   ├── database/
│   │   ├── prisma.module.ts          # Global database module
│   │   └── prisma.service.ts         # PrismaClient lifecycle connection management
│   ├── auth/                         # Staff login, session revocation, password changes
│   ├── staff/                        # Staff CRM, onboarding, profiles, and permissions
│   ├── roles/                        # Standard role catalog and permission definitions
│   ├── products/                     # Optical catalog, brands, categories, multi-variants
│   ├── inventory/                    # Movements ledger, cycle counts, adjustments, requests
│   ├── customers/                    # Customer CRM, optical prescription confidentiality
│   ├── bookings/                     # Appointment exams, try-on holds, atomic reservation release
│   ├── sales/                        # POS billing, trusted pricing, GST taxes, returns
│   ├── suppliers/                    # Optical vendors and lens manufacturing labs
│   ├── purchasing/                   # Purchase orders & duplicate-protected goods receipts
│   ├── offers/                       # Marketing campaigns, coupon validation & redemptions
│   ├── reports/                      # Dashboard KPIs, sales reports, inventory valuations
│   ├── notifications/                # Multi-channel notification logging (SMS, WhatsApp, Email)
│   ├── settings/                     # Operating hours, store profile, tax rules, receipts
│   ├── audit-logs/                   # Immutable audit logs
│   └── health/                       # Liveness and database connectivity probes
├── prisma/
│   ├── schema.prisma                 # Normalized PostgreSQL relational schema
│   └── seed.ts                       # Realistic seed data (>30 products, staff, Rx, etc.)
├── Dockerfile                        # Multi-stage production container build
├── package.json
└── tsconfig.json
```

---

## 3. Security & RBAC Matrix

| Role | Description | Key Permissions |
|---|---|---|
| **Owner/Admin** | Full unconstrained authority | All permissions including `manage_staff` and `store_settings` |
| **Store Manager** | Store operations & pricing | `pos_access`, `manage_products`, `view_cost_price`, `adjust_inventory`, `manage_suppliers`, `manage_purchase_orders`, `manage_customers`, `view_prescriptions`, `manage_bookings`, `manage_offers`, `view_financial_reports` |
| **Cashier** | Billing & front desk checkout | `pos_access`, `manage_customers`, `manage_bookings` |
| **Inventory Staff** | Warehouse & inward receiving | `manage_products`, `adjust_inventory`, `manage_suppliers`, `manage_purchase_orders` |
| **Store Assistant** | Floor assistance & check-in | `manage_customers`, `manage_bookings` |

*Prescription Confidentiality Rule*: Optical prescriptions (`OpticalPrescription`) are restricted by `view_prescriptions` and are excluded from general customer list endpoints.
*Cost Price Masking Rule*: Internal variant wholesale costs (`costPrice`) are masked from public storefront requests and only visible to authorized staff.

---

## 4. API Endpoints Catalog

### Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/login` (Public) — Authenticates staff and issues JWT token / cookie.
- `POST /api/v1/auth/logout` — Revokes session.
- `GET  /api/v1/auth/me` — Returns current staff profile and permissions.
- `POST /api/v1/auth/change-password` — Updates password with Argon2id hash.

### Product Catalogue (`/api/v1/products`)
- `GET    /api/v1/products` (Public) — Search, filter (category, brand, type, price, inStockOnly), pagination, sorting.
- `GET    /api/v1/products/:id` (Public) — Retrieve product details.
- `GET    /api/v1/products/slug/:slug` (Public) — Retrieve by SEO slug.
- `POST   /api/v1/products` — Create new product with variants.
- `PATCH  /api/v1/products/:id` — Update product.
- `DELETE /api/v1/products/:id` — Delete or archive product.
- `GET    /api/v1/categories` (Public) — List categories.
- `POST   /api/v1/categories` — Create category.
- `GET    /api/v1/brands` (Public) — List brands.
- `POST   /api/v1/brands` — Create brand.

### Inventory (`/api/v1/inventory`)
- `GET  /api/v1/inventory` — Authoritative stock balances and reorder alerts.
- `GET  /api/v1/inventory/:variantId` — Variant stock level.
- `GET  /api/v1/inventory/movements` — Complete immutable movement ledger.
- `POST /api/v1/inventory/adjustments` — Record stock adjustments with required audit reason.
- `GET  /api/v1/inventory/counts` — List cycle counts / stocktakes.
- `POST /api/v1/inventory/counts` — Initialize stocktake session.
- `POST /api/v1/inventory/counts/:id/complete` — Finalize stocktake & reconcile variances.
- `GET  /api/v1/inventory/requests` — List stock requests.
- `POST /api/v1/inventory/requests` — Submit replenishment request.
- `PATCH /api/v1/inventory/requests/:id/approve` — Approve replenishment request.

### Point of Sale & Billing (`/api/v1/sales`)
- `GET  /api/v1/sales` — List sales history.
- `GET  /api/v1/sales/:id` — Invoice details.
- `GET  /api/v1/sales/:id/receipt` — Printable receipt payload.
- `POST /api/v1/sales` — Process POS checkout (server-calculated totals, stock deduction, payment).
- `POST /api/v1/sales/:id/returns` — Process return and optional restocking.
- `GET  /api/v1/sales/returns` — List return transactions.

### Customers (`/api/v1/customers`)
- `GET   /api/v1/customers` — Paginated customers (prescriptions excluded for privacy).
- `GET   /api/v1/customers/:id` — Customer CRM profile (includes Rx if authorized).
- `POST  /api/v1/customers` — Register customer.
- `PATCH /api/v1/customers/:id` — Update customer.
- `GET   /api/v1/customers/:id/sales` — Customer purchase history.
- `GET   /api/v1/customers/:id/bookings` — Customer booking history.
- `POST  /api/v1/customers/:id/prescriptions` — Record optometrist prescription.

### Bookings & Reservations (`/api/v1`)
- `POST  /api/v1/bookings/appointments` (Public) — Schedule eye examination.
- `POST  /api/v1/reservations` (Public) — Hold frames for in-store try-on.
- `GET   /api/v1/bookings/lookup` (Public) — Secure lookup by reference & phone.
- `POST  /api/v1/reservations/:id/cancel` (Public) — Cancel reservation & release inventory.
- `GET   /api/v1/bookings` — List all bookings.
- `GET   /api/v1/bookings/:id` — Booking details.
- `PATCH /api/v1/bookings/:id/status` — Update status (releases stock on cancel/expire).

### Suppliers & Purchasing (`/api/v1`)
- `GET   /api/v1/suppliers` — List vendors.
- `POST  /api/v1/suppliers` — Create vendor.
- `GET   /api/v1/purchase-orders` — List purchase orders.
- `POST  /api/v1/purchase-orders` — Create purchase order.
- `POST  /api/v1/purchase-orders/:id/submit` — Submit purchase order.
- `GET   /api/v1/goods-receipts` — List goods receipts.
- `POST  /api/v1/goods-receipts` — Inward receipt & atomic stock addition.

### Marketing Promotions (`/api/v1`)
- `GET  /api/v1/offers` (Public) — List active offers.
- `POST /api/v1/offers` — Create promotional campaign.
- `GET  /api/v1/coupons` — List coupon codes.
- `POST /api/v1/coupons/validate` (Public) — Validate coupon code against subtotal.
- `POST /api/v1/coupons/redeem` — Record coupon redemption.

### Reports & Administration (`/api/v1`)
- `GET /api/v1/reports/dashboard` — High-level retail KPIs.
- `GET /api/v1/reports/sales` — Sales and payment method breakdown.
- `GET /api/v1/reports/inventory` — Stock valuation and low-stock alerts.
- `GET /api/v1/settings` (Public) — Store profile, opening hours, tax rates.
- `PATCH /api/v1/settings` — Update store settings.
- `GET /api/v1/audit-logs` — Immutable audit logs.
- `GET /api/v1/health` (Public) — Liveness and database connectivity probe.
