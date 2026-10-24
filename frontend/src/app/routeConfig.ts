/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const ROUTE_PATHS = {
  // Public Customer Routes
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAILS: '/products/:id',
  OFFERS: '/offers',
  STORE: '/store',
  CONTACT: '/contact',
  BOOK_APPOINTMENT: '/book/appointment',
  BOOK_RESERVATION: '/book/reservation',
  BOOKING_CONFIRMATION: '/book/confirmation',
  BOOKING_LOOKUP: '/book/lookup',
  TERMS: '/terms',
  PRIVACY: '/privacy',

  // Admin Operations Routes
  ADMIN_DASHBOARD: '/admin',
  ADMIN_POS: '/admin/pos',
  ADMIN_SALES: '/admin/sales',
  ADMIN_SALE_DETAILS: '/admin/sales/:id',
  ADMIN_RETURNS: '/admin/sales/returns',

  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_BOOKING_DETAILS: '/admin/bookings/:id',

  ADMIN_CUSTOMERS: '/admin/customers',
  ADMIN_CUSTOMER_DETAILS: '/admin/customers/:id',

  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_PRODUCT_CREATE: '/admin/products/new',
  ADMIN_PRODUCT_EDIT: '/admin/products/:id/edit',
  ADMIN_PRODUCT_DETAILS: '/admin/products/:id',

  ADMIN_INVENTORY: '/admin/inventory',
  ADMIN_STOCK_MOVEMENTS: '/admin/inventory/movements',
  ADMIN_STOCKTAKES: '/admin/inventory/stocktakes',
  ADMIN_STOCK_REQUESTS: '/admin/inventory/requests',

  ADMIN_SUPPLIERS: '/admin/suppliers',
  ADMIN_SUPPLIER_DETAILS: '/admin/suppliers/:id',
  ADMIN_PURCHASE_ORDERS: '/admin/purchasing/orders',
  ADMIN_PURCHASE_ORDER_DETAILS: '/admin/purchasing/orders/:id',
  ADMIN_GOODS_RECEIPTS: '/admin/purchasing/receipts',

  ADMIN_OFFERS: '/admin/marketing/offers',
  ADMIN_COUPONS: '/admin/marketing/coupons',

  ADMIN_REPORTS: '/admin/reports',
  ADMIN_NOTIFICATIONS: '/admin/notifications',
  ADMIN_STAFF: '/admin/staff',
  ADMIN_ROLES_PERMISSIONS: '/admin/staff/roles',
  ADMIN_STORE_SETTINGS: '/admin/settings',
  ADMIN_AUDIT_LOGS: '/admin/settings/audit',
} as const;
