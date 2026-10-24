import { SEED_DATA } from '../data/seedData';
import { Product } from '../types/product.types';
import { Customer } from '../types/customer.types';
import { Booking } from '../types/booking.types';
import { StockMovement, StockRequest, StocktakeSession } from '../types/inventory.types';
import { Sale, SaleReturn } from '../types/sales.types';
import { Supplier } from '../types/supplier.types';
import { PurchaseOrder, GoodsReceipt } from '../types/purchasing.types';
import { Offer, Coupon } from '../types/offer.types';
import { NotificationLog } from '../types/notification.types';
import { StaffMember } from '../types/staff.types';
import { StoreSettings, AuditLogEntry } from '../types/settings.types';

type Listener = () => void;

class MockDataStore {
  public products: Product[];
  public customers: Customer[];
  public bookings: Booking[];
  public stockMovements: StockMovement[];
  public stockRequests: StockRequest[];
  public stocktakes: StocktakeSession[];
  public sales: Sale[];
  public returns: SaleReturn[];
  public suppliers: Supplier[];
  public purchaseOrders: PurchaseOrder[];
  public goodsReceipts: GoodsReceipt[];
  public offers: Offer[];
  public coupons: Coupon[];
  public notifications: NotificationLog[];
  public staff: StaffMember[];
  public settings: StoreSettings;
  public auditLogs: AuditLogEntry[];

  private listeners: Set<Listener> = new Set();

  constructor() {
    this.products = this.loadOrInit('products', SEED_DATA.products);
    this.customers = this.loadOrInit('customers', SEED_DATA.customers);
    this.bookings = this.loadOrInit('bookings', SEED_DATA.bookings);
    this.stockMovements = this.loadOrInit('stockMovements', SEED_DATA.stockMovements);
    this.stockRequests = this.loadOrInit('stockRequests', SEED_DATA.stockRequests);
    this.stocktakes = this.loadOrInit('stocktakes', SEED_DATA.stocktakes);
    this.sales = this.loadOrInit('sales', SEED_DATA.sales);
    this.returns = this.loadOrInit('returns', SEED_DATA.returns);
    this.suppliers = this.loadOrInit('suppliers', SEED_DATA.suppliers);
    this.purchaseOrders = this.loadOrInit('purchaseOrders', SEED_DATA.purchaseOrders);
    this.goodsReceipts = this.loadOrInit('goodsReceipts', SEED_DATA.goodsReceipts);
    this.offers = this.loadOrInit('offers', SEED_DATA.offers);
    this.coupons = this.loadOrInit('coupons', SEED_DATA.coupons);
    this.notifications = this.loadOrInit('notifications', SEED_DATA.notifications);
    this.staff = this.loadOrInit('staff', SEED_DATA.staff);
    this.settings = this.loadOrInit('settings', SEED_DATA.settings);
    this.auditLogs = this.loadOrInit('auditLogs', SEED_DATA.auditLogs);
  }

  private loadOrInit<T>(key: string, defaultData: T): T {
    try {
      const stored = localStorage.getItem(`ocusphere_mock_${key}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback to in-memory defaults if storage disabled
    }
    return JSON.parse(JSON.stringify(defaultData));
  }

  public save<T>(key: string, data: T): void {
    try {
      localStorage.setItem(`ocusphere_mock_${key}`, JSON.stringify(data));
    } catch {
      // ignore
    }
    this.notify();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public notify(): void {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error(err);
      }
    });
  }

  public resetAll(): void {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('ocusphere_mock_')) {
          localStorage.removeItem(key);
        }
      });
    } catch {
      // ignore
    }
    this.products = JSON.parse(JSON.stringify(SEED_DATA.products));
    this.customers = JSON.parse(JSON.stringify(SEED_DATA.customers));
    this.bookings = JSON.parse(JSON.stringify(SEED_DATA.bookings));
    this.stockMovements = JSON.parse(JSON.stringify(SEED_DATA.stockMovements));
    this.stockRequests = JSON.parse(JSON.stringify(SEED_DATA.stockRequests));
    this.stocktakes = JSON.parse(JSON.stringify(SEED_DATA.stocktakes));
    this.sales = JSON.parse(JSON.stringify(SEED_DATA.sales));
    this.returns = JSON.parse(JSON.stringify(SEED_DATA.returns));
    this.suppliers = JSON.parse(JSON.stringify(SEED_DATA.suppliers));
    this.purchaseOrders = JSON.parse(JSON.stringify(SEED_DATA.purchaseOrders));
    this.goodsReceipts = JSON.parse(JSON.stringify(SEED_DATA.goodsReceipts));
    this.offers = JSON.parse(JSON.stringify(SEED_DATA.offers));
    this.coupons = JSON.parse(JSON.stringify(SEED_DATA.coupons));
    this.notifications = JSON.parse(JSON.stringify(SEED_DATA.notifications));
    this.staff = JSON.parse(JSON.stringify(SEED_DATA.staff));
    this.settings = JSON.parse(JSON.stringify(SEED_DATA.settings));
    this.auditLogs = JSON.parse(JSON.stringify(SEED_DATA.auditLogs));
    this.notify();
  }
}

export const mockStore = new MockDataStore();

/**
 * Simulates network latency for realistic async API behavior
 */
export async function simulateNetwork<T>(data: T, delayMs: number = 80): Promise<T> {
  if (delayMs > 0) {
    await new Promise((res) => setTimeout(res, delayMs));
  }
  return JSON.parse(JSON.stringify(data));
}
