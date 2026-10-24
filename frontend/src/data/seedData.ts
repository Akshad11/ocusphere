import { INITIAL_PRODUCTS } from './products';
import { INITIAL_CUSTOMERS } from './customers';
import { INITIAL_BOOKINGS } from './bookings';
import { INITIAL_STOCK_MOVEMENTS, INITIAL_STOCK_REQUESTS, INITIAL_STOCKTAKES } from './inventory';
import { INITIAL_SALES, INITIAL_RETURNS } from './sales';
import { INITIAL_SUPPLIERS } from './suppliers';
import { INITIAL_PURCHASE_ORDERS, INITIAL_GOODS_RECEIPTS } from './purchaseOrders';
import { INITIAL_OFFERS, INITIAL_COUPONS } from './offers';
import { INITIAL_NOTIFICATIONS } from './notifications';
import { INITIAL_STAFF, INITIAL_ROLE_DEFINITIONS } from './staff';
import { INITIAL_SETTINGS } from './settings';
import { INITIAL_AUDIT_LOGS } from './auditLogs';

export const SEED_DATA = {
  products: INITIAL_PRODUCTS,
  customers: INITIAL_CUSTOMERS,
  bookings: INITIAL_BOOKINGS,
  stockMovements: INITIAL_STOCK_MOVEMENTS,
  stockRequests: INITIAL_STOCK_REQUESTS,
  stocktakes: INITIAL_STOCKTAKES,
  sales: INITIAL_SALES,
  returns: INITIAL_RETURNS,
  suppliers: INITIAL_SUPPLIERS,
  purchaseOrders: INITIAL_PURCHASE_ORDERS,
  goodsReceipts: INITIAL_GOODS_RECEIPTS,
  offers: INITIAL_OFFERS,
  coupons: INITIAL_COUPONS,
  notifications: INITIAL_NOTIFICATIONS,
  staff: INITIAL_STAFF,
  roleDefinitions: INITIAL_ROLE_DEFINITIONS,
  settings: INITIAL_SETTINGS,
  auditLogs: INITIAL_AUDIT_LOGS,
};

export function resetDemoData(): void {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('ocusphere_mock_')) {
        localStorage.removeItem(key);
      }
    });
  } catch (err) {
    console.warn('Could not clear localStorage mock keys', err);
  }
}
