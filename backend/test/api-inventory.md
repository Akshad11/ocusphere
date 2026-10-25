# OcuSphere Optical Retail & POS Backend API Inventory

Comprehensive audit and inventory of all registered API endpoints in the OcuSphere NestJS Backend.
Base URL prefix: `/api/v1`

---

## 1. Authentication & Sessions (`/api/v1/auth`)

| # | Method | Endpoint | Purpose | Auth Required | Required Permission / Role | Parameters & Body | Expected Success | Expected Error | Coverage File | Initial Test Result |
|---|--------|----------|---------|---------------|----------------------------|-------------------|------------------|----------------|---------------|--------------------|
| 1 | POST | `/api/v1/auth/login` | Authenticate staff member with email and password | Public | None | Body: `LoginDto` (`email`, `password`) | `200 OK`, `{ user, accessToken, tokenType, expiresIn }` | `401 Unauthorized` (bad password/inactive) | `auth.e2e-spec.ts` | Pass |
| 2 | POST | `/api/v1/auth/logout` | Revoke session and clear HTTP cookies | Yes | None (Any Authenticated) | None | `200 OK`, `{ message: "Logged out successfully." }` | `401 Unauthorized` | `auth.e2e-spec.ts` | Pass |
| 3 | GET | `/api/v1/auth/me` | Fetch active user profile and permissions | Yes | None (Any Authenticated) | Headers: Bearer JWT | `200 OK`, safe user object without hash | `401 Unauthorized` | `auth.e2e-spec.ts` | Pass |
| 4 | POST | `/api/v1/auth/change-password` | Update current staff user password | Yes | None (Any Authenticated) | Body: `ChangePasswordDto` (`currentPassword`, `newPassword`) | `200 OK`, `{ message }` | `400 Bad Request`, `401 Unauthorized` | `auth.e2e-spec.ts` | Pass |

---

## 2. Staff, Roles & Permissions (`/api/v1/staff`, `/api/v1/roles`)

| # | Method | Endpoint | Purpose | Auth Required | Required Permission / Role | Parameters & Body | Expected Success | Expected Error | Coverage File | Initial Test Result |
|---|--------|----------|---------|---------------|----------------------------|-------------------|------------------|----------------|---------------|--------------------|
| 5 | GET | `/api/v1/roles` | List standard system role definitions & capabilities | Yes | None (Any Authenticated) | Headers: Bearer JWT | `200 OK`, `{ roles: [...], allPermissions: [...] }` | `401 Unauthorized` | `users.e2e-spec.ts` | Pass |
| 6 | GET | `/api/v1/staff` | List all staff members with merged permissions | Yes | `manage_staff` | Headers: Bearer JWT | `200 OK`, array of staff objects | `401 Unauthorized`, `403 Forbidden` | `users.e2e-spec.ts` | Pass |
| 7 | GET | `/api/v1/staff/:id` | Retrieve staff member profile by ID | Yes | `manage_staff` | Param: `id` | `200 OK`, single staff profile | `404 Not Found`, `403 Forbidden` | `users.e2e-spec.ts` | Pass |
| 8 | POST | `/api/v1/staff` | Register new employee/staff account | Yes | `manage_staff` | Body: `CreateStaffDto` (`employeeCode`, `fullName`, `email`, `phone`, `role`, `password?`, `customPermissions?`) | `201 Created`, created staff record | `400 Bad Request`, `409 Conflict`, `403 Forbidden` | `users.e2e-spec.ts` | Pass |
| 9 | PATCH | `/api/v1/staff/:id` | Update staff details, role, or active status | Yes | `manage_staff` | Param: `id`, Body: `UpdateStaffDto` | `200 OK`, updated staff record | `404 Not Found`, `403 Forbidden` | `users.e2e-spec.ts` | Pass |
| 10 | DELETE | `/api/v1/staff/:id` | Soft-deactivate staff member account | Yes | `manage_staff` | Param: `id` | `200 OK`, `{ success: true, message }` | `400 Bad Request` (deactivating self), `404 Not Found` | `users.e2e-spec.ts` | Pass |

---

## 3. Product Catalogue, Categories & Brands (`/api/v1/products`, `/api/v1/categories`, `/api/v1/brands`)

| # | Method | Endpoint | Purpose | Auth Required | Required Permission / Role | Parameters & Body | Expected Success | Expected Error | Coverage File | Initial Test Result |
|---|--------|----------|---------|---------------|----------------------------|-------------------|------------------|----------------|---------------|--------------------|
| 11 | GET | `/api/v1/products` | Paginated search and filtering of optical products | Public | None | Query: `search`, `category`, `brand`, `productType`, `gender`, `minPrice`, `maxPrice`, `page`, `pageSize` | `200 OK`, `{ items: [...], total, page, pageSize, totalPages }` | `400 Bad Request` | `products.e2e-spec.ts` | Pass |
| 12 | GET | `/api/v1/products/slug/:slug` | Retrieve product details by SEO slug | Public | None | Param: `slug` | `200 OK`, complete product with variants | `404 Not Found` | `products.e2e-spec.ts` | Pass |
| 13 | GET | `/api/v1/products/:id` | Retrieve product details by UUID | Public | None | Param: `id` | `200 OK`, complete product with variants | `404 Not Found` | `products.e2e-spec.ts` | Pass |
| 14 | POST | `/api/v1/products` | Create optical product and SKU variants | Yes | `manage_products` | Body: `CreateProductDto` | `201 Created`, created product | `400 Bad Request`, `409 Conflict`, `403 Forbidden` | `products.e2e-spec.ts` | Pass |
| 15 | PATCH | `/api/v1/products/:id` | Update product details, specs, or pricing | Yes | `manage_products` | Param: `id`, Body: `UpdateProductDto` | `200 OK`, updated product | `404 Not Found`, `403 Forbidden` | `products.e2e-spec.ts` | Pass |
| 16 | DELETE | `/api/v1/products/:id` | Archive or delete product record | Yes | `manage_products` | Param: `id` | `200 OK`, `{ success: true }` | `404 Not Found`, `403 Forbidden` | `products.e2e-spec.ts` | Pass |
| 17 | GET | `/api/v1/categories` | List all eyewear categories | Public | None | None | `200 OK`, array of categories | None | `products.e2e-spec.ts` | Pass |
| 18 | POST | `/api/v1/categories` | Create new eyewear category | Yes | `manage_products` | Body: `{ name, slug?, description? }` | `201 Created`, created category | `400 Bad Request`, `403 Forbidden` | `products.e2e-spec.ts` | Pass |
| 19 | GET | `/api/v1/brands` | List all optical brands | Public | None | None | `200 OK`, array of brands | None | `products.e2e-spec.ts` | Pass |
| 20 | POST | `/api/v1/brands` | Create new optical brand | Yes | `manage_products` | Body: `{ name, slug?, description? }` | `201 Created`, created brand | `400 Bad Request`, `403 Forbidden` | `products.e2e-spec.ts` | Pass |

---

## 4. Inventory, Stock Movements & Stocktakes (`/api/v1/inventory`)

| # | Method | Endpoint | Purpose | Auth Required | Required Permission / Role | Parameters & Body | Expected Success | Expected Error | Coverage File | Initial Test Result |
|---|--------|----------|---------|---------------|----------------------------|-------------------|------------------|----------------|---------------|--------------------|
| 21 | GET | `/api/v1/inventory` | Retrieve stock balances and reorder alerts | Yes | `adjust_inventory` | Query: `search`, `lowStockOnly`, `page`, `pageSize` | `200 OK`, `{ items: [...], total, lowStockCount }` | `401 Unauthorized`, `403 Forbidden` | `inventory.e2e-spec.ts` | Pass |
| 22 | GET | `/api/v1/inventory/movements` | Query immutable stock movement ledger | Yes | `adjust_inventory` | Query: `variantId`, `movementType`, `page`, `pageSize` | `200 OK`, paginated movement audit log | `401 Unauthorized`, `403 Forbidden` | `inventory.e2e-spec.ts` | Pass |
| 23 | GET | `/api/v1/inventory/counts` | List physical stocktake sessions | Yes | `adjust_inventory` | None | `200 OK`, array of stocktake sessions | `401 Unauthorized`, `403 Forbidden` | `inventory.e2e-spec.ts` | Pass |
| 24 | POST | `/api/v1/inventory/counts` | Initialize a new stocktake session | Yes | `adjust_inventory` | Body: `CreateStocktakeDto` | `201 Created`, created session | `400 Bad Request`, `403 Forbidden` | `inventory.e2e-spec.ts` | Pass |
| 25 | POST | `/api/v1/inventory/counts/:id/complete` | Finalize stocktake & optionally reconcile | Yes | `adjust_inventory` | Param: `id`, Body: `CompleteStocktakeDto` | `200 OK`, completed session | `404 Not Found`, `400 Bad Request` | `inventory.e2e-spec.ts` | Pass |
| 26 | GET | `/api/v1/inventory/requests` | List branch stock replenishment requests | Yes | `adjust_inventory` | None | `200 OK`, array of requests | `401 Unauthorized`, `403 Forbidden` | `inventory.e2e-spec.ts` | Pass |
| 27 | POST | `/api/v1/inventory/requests` | Submit stock replenishment request | Yes | `adjust_inventory` | Body: `CreateStockRequestDto` | `201 Created`, created stock request | `400 Bad Request`, `403 Forbidden` | `inventory.e2e-spec.ts` | Pass |
| 28 | PATCH | `/api/v1/inventory/requests/:id/approve` | Approve stock replenishment request | Yes | `approve_stock_requests` | Param: `id`, Body: `{ notes? }` | `200 OK`, approved stock request | `404 Not Found`, `403 Forbidden` | `inventory.e2e-spec.ts` | Pass |
| 29 | POST | `/api/v1/inventory/adjustments` | Manual stock adjustment with audit reason | Yes | `adjust_inventory` | Body: `StockAdjustmentDto` | `201 Created`, `{ variant, movement }` | `400 Bad Request`, `404 Not Found` | `inventory.e2e-spec.ts` | Pass |
| 30 | GET | `/api/v1/inventory/:productVariantId` | Retrieve stock balance for variant | Yes | `adjust_inventory` | Param: `productVariantId` | `200 OK`, variant stock status | `404 Not Found`, `403 Forbidden` | `inventory.e2e-spec.ts` | Pass |

---

## 5. Customers & Optical Prescriptions (`/api/v1/customers`)

| # | Method | Endpoint | Purpose | Auth Required | Required Permission / Role | Parameters & Body | Expected Success | Expected Error | Coverage File | Initial Test Result |
|---|--------|----------|---------|---------------|----------------------------|-------------------|------------------|----------------|---------------|--------------------|
| 31 | GET | `/api/v1/customers` | Paginated customer list (Rx stripped for privacy) | Yes | `manage_customers` | Query: `search`, `page`, `pageSize` | `200 OK`, `{ items: [...], total, page, pageSize }` | `401 Unauthorized`, `403 Forbidden` | `customers.e2e-spec.ts` | Pass |
| 32 | GET | `/api/v1/customers/:id` | Customer CRM profile (Includes Rx if permitted) | Yes | `manage_customers` | Param: `id` | `200 OK`, full customer details | `404 Not Found`, `403 Forbidden` | `customers.e2e-spec.ts` | Pass |
| 33 | POST | `/api/v1/customers` | Register new store customer | Yes | `manage_customers` | Body: `CreateCustomerDto` | `201 Created`, created customer record | `400 Bad Request`, `409 Conflict` | `customers.e2e-spec.ts` | Pass |
| 34 | PATCH | `/api/v1/customers/:id` | Update customer contact and details | Yes | `manage_customers` | Param: `id`, Body: `UpdateCustomerDto` | `200 OK`, updated customer | `404 Not Found`, `403 Forbidden` | `customers.e2e-spec.ts` | Pass |
| 35 | GET | `/api/v1/customers/:id/sales` | Retrieve purchase invoice history for customer | Yes | `manage_customers` | Param: `id` | `200 OK`, array of past sales | `404 Not Found`, `403 Forbidden` | `customers.e2e-spec.ts` | Pass |
| 36 | GET | `/api/v1/customers/:id/bookings` | Retrieve appointment and reservation history | Yes | `manage_customers` | Param: `id` | `200 OK`, array of bookings | `404 Not Found`, `403 Forbidden` | `customers.e2e-spec.ts` | Pass |
| 37 | POST | `/api/v1/customers/:id/prescriptions` | Record optometrist refraction eye test Rx | Yes | `view_prescriptions` | Param: `id`, Body: `CreatePrescriptionDto` | `201 Created`, created prescription | `400 Bad Request`, `403 Forbidden` | `customers.e2e-spec.ts` | Pass |

---

## 6. Appointments & Reservations (`/api/v1/bookings`, `/api/v1/reservations`)

| # | Method | Endpoint | Purpose | Auth Required | Required Permission / Role | Parameters & Body | Expected Success | Expected Error | Coverage File | Initial Test Result |
|---|--------|----------|---------|---------------|----------------------------|-------------------|------------------|----------------|---------------|--------------------|
| 38 | POST | `/api/v1/bookings/appointments` | Book optometry eye examination appointment | Public | None | Body: `CreateAppointmentDto` | `201 Created`, appointment booking | `400 Bad Request` | `bookings.e2e-spec.ts` | Pass |
| 39 | POST | `/api/v1/reservations` | Reserve physical frame variant in-store | Public | None | Body: `CreateReservationDto` | `201 Created`, reservation record + stock hold | `400 Bad Request` (out of stock) | `bookings.e2e-spec.ts` | Pass |
| 40 | GET | `/api/v1/bookings/lookup` | Public booking lookup by reference and phone | Public | None | Query: `referenceNumber`, `phone` | `200 OK`, booking details | `404 Not Found`, `400 Bad Request` | `bookings.e2e-spec.ts` | Pass |
| 41 | POST | `/api/v1/reservations/:id/cancel` | Cancel reservation & release reserved stock | Public | None | Param: `id`, Body: `{ reason? }` | `200 OK`, cancelled booking + stock released | `404 Not Found`, `400 Bad Request` | `bookings.e2e-spec.ts` | Pass |
| 42 | GET | `/api/v1/bookings` | List all bookings with type/status filters | Yes | `manage_bookings` | Query: `bookingType`, `status`, `search`, `date` | `200 OK`, array of bookings | `401 Unauthorized`, `403 Forbidden` | `bookings.e2e-spec.ts` | Pass |
| 43 | GET | `/api/v1/bookings/:id` | Retrieve single booking details by ID | Yes | `manage_bookings` | Param: `id` | `200 OK`, booking details with customer | `404 Not Found`, `403 Forbidden` | `bookings.e2e-spec.ts` | Pass |
| 44 | PATCH | `/api/v1/bookings/:id/status` | Advance booking status through workflow | Yes | `manage_bookings` | Param: `id`, Body: `UpdateBookingStatusDto` | `200 OK`, updated booking | `400 Bad Request` (invalid transition) | `bookings.e2e-spec.ts` | Pass |

---

## 7. Point of Sale (POS), Sales & Returns (`/api/v1/sales`)

| # | Method | Endpoint | Purpose | Auth Required | Required Permission / Role | Parameters & Body | Expected Success | Expected Error | Coverage File | Initial Test Result |
|---|--------|----------|---------|---------------|----------------------------|-------------------|------------------|----------------|---------------|--------------------|
| 45 | GET | `/api/v1/sales` | List sales transactions and invoices | Yes | `pos_access` | Query: `search`, `status`, `paymentMethod`, `date` | `200 OK`, array of sales invoices | `401 Unauthorized`, `403 Forbidden` | `sales.e2e-spec.ts` | Pass |
| 46 | GET | `/api/v1/sales/returns` | List all processed return transactions | Yes | `pos_access` | None | `200 OK`, array of return records | `401 Unauthorized`, `403 Forbidden` | `returns.e2e-spec.ts` | Pass |
| 47 | GET | `/api/v1/sales/:id` | Retrieve sale record and line items | Yes | `pos_access` | Param: `id` | `200 OK`, complete sale with items & payments | `404 Not Found`, `403 Forbidden` | `sales.e2e-spec.ts` | Pass |
| 48 | GET | `/api/v1/sales/:id/receipt` | Printable tax invoice receipt payload | Yes | `pos_access` | Param: `id` | `200 OK`, thermal receipt formatted data | `404 Not Found`, `403 Forbidden` | `sales.e2e-spec.ts` | Pass |
| 49 | POST | `/api/v1/sales` | Checkout POS sale, deduct inventory, generate invoice | Yes | `pos_access` | Body: `CreateSaleDto` (items, paymentMethod, customerId?, idempotencyKey?) | `201 Created`, created sale invoice | `400 Bad Request` (insufficient stock), `409 Conflict` (idempotency) | `sales.e2e-spec.ts` | Pass |
| 50 | POST | `/api/v1/sales/:id/returns` | Process returns, refund, and optional restock | Yes | `pos_access` | Param: `id`, Body: `ProcessReturnDto` | `201 Created`, processed return record | `400 Bad Request` (exceeds sold qty), `404 Not Found` | `returns.e2e-spec.ts` | Pass |

---

## 8. Suppliers, Purchase Orders & Goods Receipts (`/api/v1/suppliers`, `/api/v1/purchase-orders`, `/api/v1/goods-receipts`)

| # | Method | Endpoint | Purpose | Auth Required | Required Permission / Role | Parameters & Body | Expected Success | Expected Error | Coverage File | Initial Test Result |
|---|--------|----------|---------|---------------|----------------------------|-------------------|------------------|----------------|---------------|--------------------|
| 51 | GET | `/api/v1/suppliers` | List all optical vendors and laboratories | Yes | `manage_suppliers` | None | `200 OK`, array of suppliers | `401 Unauthorized`, `403 Forbidden` | `suppliers.e2e-spec.ts` | Pass |
| 52 | GET | `/api/v1/suppliers/:id` | Retrieve supplier profile and recent POs | Yes | `manage_suppliers` | Param: `id` | `200 OK`, single supplier profile | `404 Not Found`, `403 Forbidden` | `suppliers.e2e-spec.ts` | Pass |
| 53 | POST | `/api/v1/suppliers` | Register new optical supplier/vendor | Yes | `manage_suppliers` | Body: `CreateSupplierDto` | `201 Created`, created supplier | `400 Bad Request`, `409 Conflict` | `suppliers.e2e-spec.ts` | Pass |
| 54 | PATCH | `/api/v1/suppliers/:id` | Update supplier details or payment terms | Yes | `manage_suppliers` | Param: `id`, Body: `UpdateSupplierDto` | `200 OK`, updated supplier | `404 Not Found`, `403 Forbidden` | `suppliers.e2e-spec.ts` | Pass |
| 55 | GET | `/api/v1/purchase-orders` | List vendor purchase orders | Yes | `manage_purchase_orders` | Query: `search`, `status` | `200 OK`, array of purchase orders | `401 Unauthorized`, `403 Forbidden` | `purchase-orders.e2e-spec.ts` | Pass |
| 56 | GET | `/api/v1/purchase-orders/:id` | Retrieve specific PO with line items | Yes | `manage_purchase_orders` | Param: `id` | `200 OK`, full PO details | `404 Not Found`, `403 Forbidden` | `purchase-orders.e2e-spec.ts` | Pass |
| 57 | POST | `/api/v1/purchase-orders` | Create a new vendor purchase order | Yes | `manage_purchase_orders` | Body: `CreatePurchaseOrderDto` | `201 Created`, draft purchase order | `400 Bad Request`, `403 Forbidden` | `purchase-orders.e2e-spec.ts` | Pass |
| 58 | POST | `/api/v1/purchase-orders/:id/submit` | Transition purchase order to Sent status | Yes | `manage_purchase_orders` | Param: `id` | `200 OK`, sent purchase order | `400 Bad Request`, `404 Not Found` | `purchase-orders.e2e-spec.ts` | Pass |
| 59 | GET | `/api/v1/goods-receipts` | List all processed inbound goods receipts | Yes | `manage_purchase_orders` | None | `200 OK`, array of receipts | `401 Unauthorized`, `403 Forbidden` | `goods-receipts.e2e-spec.ts` | Pass |
| 60 | GET | `/api/v1/goods-receipts/:id` | Retrieve specific goods receipt with items | Yes | `manage_purchase_orders` | Param: `id` | `200 OK`, receipt details | `404 Not Found`, `403 Forbidden` | `goods-receipts.e2e-spec.ts` | Pass |
| 61 | POST | `/api/v1/goods-receipts` | Receive stock shipment, update PO & balances | Yes | `manage_purchase_orders` | Body: `CreateGoodsReceiptDto` | `201 Created`, created goods receipt | `400 Bad Request`, `404 Not Found` | `goods-receipts.e2e-spec.ts` | Pass |

---

## 9. Offers & Promotional Coupons (`/api/v1/offers`, `/api/v1/coupons`)

| # | Method | Endpoint | Purpose | Auth Required | Required Permission / Role | Parameters & Body | Expected Success | Expected Error | Coverage File | Initial Test Result |
|---|--------|----------|---------|---------------|----------------------------|-------------------|------------------|----------------|---------------|--------------------|
| 62 | GET | `/api/v1/offers` | List promotional offers (Storefront Public) | Public | None | Query: `activeOnly` | `200 OK`, array of offers | None | `coupons.e2e-spec.ts` | Pass |
| 63 | GET | `/api/v1/offers/:id` | Retrieve promotional campaign details | Public | None | Param: `id` | `200 OK`, single offer details | `404 Not Found` | `coupons.e2e-spec.ts` | Pass |
| 64 | POST | `/api/v1/offers` | Create new promotion and associated coupons | Yes | `manage_offers` | Body: `CreateOfferDto` | `201 Created`, created offer | `400 Bad Request`, `403 Forbidden` | `coupons.e2e-spec.ts` | Pass |
| 65 | GET | `/api/v1/coupons` | List all coupons and redemption stats | Yes | `manage_offers` | None | `200 OK`, array of coupons | `401 Unauthorized`, `403 Forbidden` | `coupons.e2e-spec.ts` | Pass |
| 66 | POST | `/api/v1/coupons/validate` | Validate coupon code and calculate discount | Public | None | Body: `ValidateCouponDto` (`code`, `subtotal`, `customerPhone?`) | `200 OK`, `{ valid: true, discountAmount, ... }` | `400 Bad Request` (expired/ineligible) | `coupons.e2e-spec.ts` | Pass |
| 67 | POST | `/api/v1/coupons/redeem` | Authoritative coupon redemption | Yes | `pos_access` | Body: `RedeemCouponDto` | `200 OK`, `{ success: true, redeemedCoupon }` | `400 Bad Request` (exhausted) | `coupons.e2e-spec.ts` | Pass |

---

## 10. Reports & Dashboard Analytics (`/api/v1/reports`)

| # | Method | Endpoint | Purpose | Auth Required | Required Permission / Role | Parameters & Body | Expected Success | Expected Error | Coverage File | Initial Test Result |
|---|--------|----------|---------|---------------|----------------------------|-------------------|------------------|----------------|---------------|--------------------|
| 68 | GET | `/api/v1/reports/dashboard` | Executive KPIs, valuation, and retail metrics | Yes | `view_financial_reports` | Headers: Bearer JWT | `200 OK`, high-level retail stats | `401 Unauthorized`, `403 Forbidden` | `reports.e2e-spec.ts` | Pass |
| 69 | GET | `/api/v1/reports/sales` | Aggregate sales analytics and payment mix | Yes | `view_financial_reports` | Query: `startDate`, `endDate` | `200 OK`, sales summary report | `401 Unauthorized`, `403 Forbidden` | `reports.e2e-spec.ts` | Pass |
| 70 | GET | `/api/v1/reports/inventory` | Inventory valuation and low-stock analysis | Yes | `adjust_inventory` | None | `200 OK`, valuation report | `401 Unauthorized`, `403 Forbidden` | `reports.e2e-spec.ts` | Pass |

---

## 11. Notifications, Settings, Audit Logs & Health

| # | Method | Endpoint | Purpose | Auth Required | Required Permission / Role | Parameters & Body | Expected Success | Expected Error | Coverage File | Initial Test Result |
|---|--------|----------|---------|---------------|----------------------------|-------------------|------------------|----------------|---------------|--------------------|
| 71 | GET | `/api/v1/notifications` | List SMS/WhatsApp customer notification logs | Yes | `manage_bookings` | Query: `channel`, `type` | `200 OK`, array of notification logs | `401 Unauthorized`, `403 Forbidden` | `admin-access.e2e-spec.ts` | Pass |
| 72 | POST | `/api/v1/notifications/:id/retry` | Re-dispatch failed/queued notification | Yes | `manage_bookings` | Param: `id` | `200 OK`, updated notification record | `404 Not Found`, `403 Forbidden` | `admin-access.e2e-spec.ts` | Pass |
| 73 | GET | `/api/v1/settings` | Store profile, address, GSTIN, hours, taxes | Public | None | None | `200 OK`, store settings object | None | `admin-access.e2e-spec.ts` | Pass |
| 74 | PATCH | `/api/v1/settings` | Update store configuration & operating rules | Yes | `store_settings` | Body: `UpdateSettingsDto` | `200 OK`, updated store settings | `400 Bad Request`, `403 Forbidden` | `admin-access.e2e-spec.ts` | Pass |
| 75 | GET | `/api/v1/audit-logs` | Query immutable system audit logs | Yes | `store_settings` | Query: `entity`, `action` | `200 OK`, array of audit entries | `401 Unauthorized`, `403 Forbidden` | `admin-access.e2e-spec.ts` | Pass |
| 76 | GET | `/api/v1/health` | Service health & PostgreSQL connectivity | Public | None | None | `200 OK`, `{ status: "ok", services: { database: "up", api: "up" } }` | None | `admin-access.e2e-spec.ts` | Pass |

---

## Summary

- **Total Registered Endpoints:** 76
- **Public Endpoints:** 16
- **Authenticated & Protected Endpoints:** 60
- **Automated Test Coverage:** 100% across 13 dedicated E2E test suites
