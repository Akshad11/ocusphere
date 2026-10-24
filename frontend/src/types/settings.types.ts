export interface StoreSettings {
  storeName: string;
  tagline: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  phone: string;
  email: string;
  gstin: string; // Indian GST Identification Number
  openingHours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  bookingCapacityPerHour: number;
  reservationHoldDays: number; // e.g. 3 days before auto-expiry
  currency: 'INR';
  currencySymbol: '₹';
  taxRatePercent: number; // e.g. 12%
  receiptHeader: string;
  receiptFooter: string;
  enableSmsNotifications: boolean;
  enableWhatsappNotifications: boolean;
  enableEmailNotifications: boolean;
}

export interface AuditLogEntry {
  id: string;
  actorName: string;
  actorRole: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'SALE' | 'RECEIPT' | 'ADJUST' | 'LOGIN';
  entity: 'Product' | 'Inventory' | 'Customer' | 'Booking' | 'Sale' | 'PurchaseOrder' | 'StockRequest' | 'Offer' | 'Staff' | 'Settings';
  entityId?: string;
  summary: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  timestamp: string;
}
