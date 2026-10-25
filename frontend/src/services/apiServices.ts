import { apiClient } from './apiClient';
import { ProductService, CreateProductInput, UpdateProductInput } from './mockProductService';
import { SalesService, CreateSaleInput } from './mockSalesService';
import { CustomerService } from './mockCustomerService';
import { BookingService } from './mockBookingService';
import { InventoryService } from './mockInventoryService';
import { SupplierService } from './mockSupplierService';
import { PurchaseOrderService } from './mockPurchaseOrderService';
import { OfferService } from './mockOfferService';
import { ReportService } from './mockReportService';
import { StaffService } from './mockStaffService';
import { Product, ProductListParams } from '../types/product.types';
import { PaginatedResult } from '../types/common.types';
import { Sale, SaleReturn } from '../types/sales.types';
import { Customer, CreateCustomerInput, OpticalPrescription } from '../types/customer.types';
import { Booking, CreateAppointmentInput, CreateReservationInput, BookingStatus } from '../types/booking.types';
import { StockAdjustmentInput, StockMovement, StockRequest, StocktakeSession } from '../types/inventory.types';
import { Supplier, CreateSupplierInput } from '../types/supplier.types';
import { PurchaseOrder, GoodsReceipt } from '../types/purchasing.types';
import { Offer, Coupon } from '../types/offer.types';
import { StaffMember, RoleDefinition } from '../types/staff.types';

export class ApiProductService implements ProductService {
  async list(params: ProductListParams = {}): Promise<PaginatedResult<Product>> {
    const raw: any = await apiClient.get('/products', params);
    const items = Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : [];
    const sanitized = items.map((p: any) => ({
      ...p,
      images: Array.isArray(p.images) ? p.images : [],
      variants: Array.isArray(p.variants)
        ? p.variants.map((v: any) => ({
            ...v,
            images: Array.isArray(v.images) ? v.images : [],
          }))
        : [],
    }));
    return {
      items: sanitized,
      total: raw?.total ?? sanitized.length,
      page: raw?.page ?? 1,
      pageSize: raw?.pageSize ?? (params.pageSize || 12),
      totalPages: raw?.totalPages ?? 1,
    };
  }

  async getById(id: string): Promise<Product> {
    const p: any = await apiClient.get<Product>(`/products/${id}`);
    return {
      ...p,
      images: Array.isArray(p?.images) ? p.images : [],
      variants: Array.isArray(p?.variants)
        ? p.variants.map((v: any) => ({
            ...v,
            images: Array.isArray(v.images) ? v.images : [],
          }))
        : [],
    };
  }

  async getBySlug(slug: string): Promise<Product> {
    const p: any = await apiClient.get<Product>(`/products/slug/${slug}`);
    return {
      ...p,
      images: Array.isArray(p?.images) ? p.images : [],
      variants: Array.isArray(p?.variants)
        ? p.variants.map((v: any) => ({
            ...v,
            images: Array.isArray(v.images) ? v.images : [],
          }))
        : [],
    };
  }

  async create(input: CreateProductInput): Promise<Product> {
    return apiClient.post<Product>('/products', input);
  }

  async update(id: string, input: UpdateProductInput): Promise<Product> {
    return apiClient.patch<Product>(`/products/${id}`, input);
  }

  async delete(id: string): Promise<boolean> {
    await apiClient.delete(`/products/${id}`);
    return true;
  }
}

export class ApiSalesService implements SalesService {
  async list(params: { search?: string; status?: string; paymentMethod?: string; date?: string } = {}): Promise<Sale[]> {
    const raw: any = await apiClient.get('/sales', params);
    const items = Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : [];
    return items.map((s: any) => ({
      ...s,
      items: Array.isArray(s.items) ? s.items : [],
    }));
  }

  async getById(id: string): Promise<Sale> {
    const s: any = await apiClient.get<Sale>(`/sales/${id}`);
    return {
      ...s,
      items: Array.isArray(s?.items) ? s.items : [],
    };
  }

  async createSale(input: CreateSaleInput): Promise<Sale> {
    return apiClient.post<Sale>('/sales', input);
  }

  async processReturn(
    saleId: string,
    refundMethod: 'Cash' | 'UPI' | 'Card' | 'Split' | 'Other',
    items: Array<{
      saleItemId: string;
      variantId: string;
      returnedQuantity: number;
      reason: any;
      restockStock: boolean;
    }>,
    processedBy?: string,
  ): Promise<SaleReturn> {
    return apiClient.post<SaleReturn>(`/sales/${saleId}/returns`, {
      refundMethod,
      items,
      processedBy,
    });
  }

  async listReturns(): Promise<SaleReturn[]> {
    const raw: any = await apiClient.get('/sales/returns');
    return Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : [];
  }
}

export class ApiCustomerService implements CustomerService {
  async list(params: { search?: string; page?: number; pageSize?: number } = {}): Promise<PaginatedResult<Customer>> {
    const raw: any = await apiClient.get('/customers', params);
    const items = Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : [];
    const sanitized = items.map((c: any) => ({
      ...c,
      prescriptions: Array.isArray(c.prescriptions) ? c.prescriptions : [],
    }));
    return {
      items: sanitized,
      total: raw?.total ?? sanitized.length,
      page: raw?.page ?? 1,
      pageSize: raw?.pageSize ?? (params.pageSize || 10),
      totalPages: raw?.totalPages ?? 1,
    };
  }

  async getById(id: string): Promise<Customer> {
    const c: any = await apiClient.get<Customer>(`/customers/${id}`);
    return {
      ...c,
      prescriptions: Array.isArray(c?.prescriptions) ? c.prescriptions : [],
    };
  }

  async create(input: CreateCustomerInput): Promise<Customer> {
    return apiClient.post<Customer>('/customers', input);
  }

  async update(id: string, input: Partial<CreateCustomerInput>): Promise<Customer> {
    return apiClient.patch<Customer>(`/customers/${id}`, input);
  }

  async addPrescription(
    customerId: string,
    rx: Omit<OpticalPrescription, 'id' | 'customerId' | 'recordedDate'>,
  ): Promise<OpticalPrescription> {
    return apiClient.post<OpticalPrescription>(`/customers/${customerId}/prescriptions`, rx);
  }

  async getCustomerSales(id: string): Promise<Sale[]> {
    const raw: any = await apiClient.get(`/customers/${id}/sales`);
    return Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : [];
  }

  async getCustomerBookings(id: string): Promise<Booking[]> {
    const raw: any = await apiClient.get(`/customers/${id}/bookings`);
    return Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : [];
  }
}

export class ApiBookingService implements BookingService {
  async list(params: { bookingType?: string; status?: string; date?: string; search?: string } = {}): Promise<Booking[]> {
    const raw: any = await apiClient.get('/bookings', params);
    const items = Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : [];
    return items.map((b: any) => ({
      ...b,
      reservedItems: Array.isArray(b.reservedItems) ? b.reservedItems : [],
    }));
  }

  async getById(id: string): Promise<Booking> {
    const b: any = await apiClient.get<Booking>(`/bookings/${id}`);
    return {
      ...b,
      reservedItems: Array.isArray(b?.reservedItems) ? b.reservedItems : [],
    };
  }

  async createAppointment(input: CreateAppointmentInput): Promise<Booking> {
    return apiClient.post<Booking>('/bookings/appointments', input);
  }

  async createReservation(input: CreateReservationInput): Promise<Booking> {
    return apiClient.post<Booking>('/reservations', input);
  }

  async lookup(referenceNumber: string, phone: string): Promise<Booking> {
    return apiClient.get<Booking>('/bookings/lookup', { referenceNumber, phone });
  }

  async updateStatus(id: string, status: BookingStatus, note?: string): Promise<Booking> {
    return apiClient.patch<Booking>(`/bookings/${id}/status`, { status, note });
  }

  async cancelReservation(id: string, reason?: string): Promise<Booking> {
    return apiClient.post<Booking>(`/reservations/${id}/cancel`, { reason });
  }
}

export class ApiInventoryService implements InventoryService {
  async listStock(params: {
    search?: string;
    stockStatus?: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
    productType?: string;
  } = {}): Promise<InventoryItemRow[]> {
    const raw: any = await apiClient.get('/inventory', {
      search: params.search,
      lowStockOnly: params.stockStatus === 'low_stock',
    });
    const items = Array.isArray(raw) ? raw : raw?.items || [];
    return items.map((i: any) => ({
      variantId: i.id || i.variantId,
      productId: i.productId || '',
      productName: i.product?.name || i.productName || 'Optical Item',
      brand: i.product?.brand || i.brand || 'OcuSphere',
      category: i.product?.category || i.category || 'Eyewear',
      productType: i.product?.category || i.productType || 'Eyewear',
      variantSku: i.variantSku || '',
      barcode: i.barcode || '',
      colorName: i.colorName || '',
      size: i.size || '',
      sellingPrice: Number(i.sellingPrice || 0),
      costPrice: Number(i.costPrice || 0),
      stockOnHand: Number(i.stockOnHand || 0),
      reservedQuantity: Number(i.reservedQuantity || 0),
      availableQuantity: Math.max(0, Number(i.stockOnHand || 0) - Number(i.reservedQuantity || 0)),
      reorderLevel: Number(i.reorderLevel || 5),
      stockStatus: (i.stockOnHand <= 0 ? 'Out of Stock' : i.stockOnHand <= (i.reorderLevel || 5) ? 'Low Stock' : 'In Stock') as any,
      lastMovementDate: i.updatedAt || new Date().toISOString(),
    }));
  }

  async getMovements(variantId?: string): Promise<StockMovement[]> {
    const raw: any = await apiClient.get('/inventory/movements', { variantId });
    return Array.isArray(raw) ? raw : raw?.items || [];
  }

  async adjustStock(input: StockAdjustmentInput, performedBy?: string): Promise<any> {
    const res: any = await apiClient.post('/inventory/adjustments', { ...input, performedBy });
    return res.movement || res;
  }

  async getStockRequests(): Promise<StockRequest[]> {
    const raw: any = await apiClient.get('/inventory/requests');
    return Array.isArray(raw) ? raw : raw?.items || [];
  }

  async createStockRequest(input: Omit<StockRequest, 'id' | 'requestNumber' | 'createdAt' | 'updatedAt'>): Promise<StockRequest> {
    return apiClient.post<StockRequest>('/inventory/requests', input);
  }

  async updateStockRequestStatus(id: string, status: StockRequest['status'], approverNotes?: string, approvedBy?: string): Promise<StockRequest> {
    return apiClient.patch<StockRequest>(`/inventory/requests/${id}/approve`, { notes: approverNotes, approverName: approvedBy });
  }

  async getStocktakes(): Promise<StocktakeSession[]> {
    const raw: any = await apiClient.get('/inventory/counts');
    return Array.isArray(raw) ? raw : raw?.items || [];
  }

  async saveStocktake(session: StocktakeSession): Promise<StocktakeSession> {
    return apiClient.post<StocktakeSession>('/inventory/counts', session);
  }

  // Compatibility aliases
  async list(params: any = {}) { return this.listStock(params); }
  async getById(variantId: string) { return apiClient.get(`/inventory/${variantId}`); }
  async listMovements(params: any = {}) { return this.getMovements(params?.variantId); }
  async listStockRequests() { return this.getStockRequests(); }
  async listStocktakes() { return this.getStocktakes(); }
  async completeStocktake(id: string, reconcileInventory: boolean = true) {
    return apiClient.post(`/inventory/counts/${id}/complete`, { reconcileInventory });
  }
}

export class ApiSupplierService implements SupplierService {
  async list(): Promise<Supplier[]> {
    return apiClient.get<Supplier[]>('/suppliers');
  }

  async getById(id: string): Promise<Supplier> {
    return apiClient.get<Supplier>(`/suppliers/${id}`);
  }

  async create(input: CreateSupplierInput): Promise<Supplier> {
    return apiClient.post<Supplier>('/suppliers', input);
  }

  async update(id: string, input: Partial<CreateSupplierInput>): Promise<Supplier> {
    return apiClient.patch<Supplier>(`/suppliers/${id}`, input);
  }
}

export class ApiPurchaseOrderService implements PurchaseOrderService {
  async list(params: { status?: string; search?: string; supplierId?: string } = {}): Promise<PurchaseOrder[]> {
    const raw: any = await apiClient.get<PurchaseOrder[]>('/purchase-orders', params);
    return Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : [];
  }

  async getById(id: string): Promise<PurchaseOrder> {
    const po: any = await apiClient.get<PurchaseOrder>(`/purchase-orders/${id}`);
    return {
      ...po,
      items: Array.isArray(po?.items) ? po.items : [],
    };
  }

  async create(input: any): Promise<PurchaseOrder> {
    return apiClient.post<PurchaseOrder>('/purchase-orders', input);
  }

  async submit(id: string): Promise<PurchaseOrder> {
    return apiClient.post<PurchaseOrder>(`/purchase-orders/${id}/submit`);
  }

  async confirmGoodsReceipt(input: any): Promise<GoodsReceipt> {
    return apiClient.post<GoodsReceipt>('/goods-receipts', input);
  }

  async receiveGoods(input: any): Promise<GoodsReceipt> {
    return this.confirmGoodsReceipt(input);
  }

  async listGoodsReceipts(): Promise<GoodsReceipt[]> {
    const raw: any = await apiClient.get<GoodsReceipt[]>('/goods-receipts');
    return Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : [];
  }
}

export class ApiOfferService implements OfferService {
  async listOffers(activeOnly: boolean = false): Promise<Offer[]> {
    const raw: any = await apiClient.get<Offer[]>('/offers', { activeOnly });
    return Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : [];
  }

  async listCoupons(): Promise<Coupon[]> {
    const raw: any = await apiClient.get<Coupon[]>('/coupons');
    return Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : [];
  }

  async validateCoupon(code: string, subtotal: number, customerPhone?: string): Promise<any> {
    return apiClient.post('/coupons/validate', { code, subtotal, customerPhone });
  }

  async createOffer(input: any): Promise<Offer> {
    return apiClient.post<Offer>('/offers', input);
  }
}

export class ApiReportService implements ReportService {
  async getSalesSummary(startDate?: string, endDate?: string): Promise<SalesReportSummary> {
    const [dash, sales]: [any, any] = await Promise.all([
      apiClient.get('/reports/dashboard').catch(() => ({})),
      apiClient.get('/reports/sales', { startDate, endDate }).catch(() => ({})),
    ]);

    return {
      totalRevenue: dash.totalRevenue || sales?.summary?.totalRevenue || 0,
      transactionCount: dash.totalOrders || sales?.summary?.transactionCount || 0,
      averageOrderValue: dash.averageOrderValue || sales?.summary?.averageOrderValue || 0,
      totalTax: sales?.summary?.totalTax || 0,
      totalDiscounts: sales?.summary?.totalDiscounts || 0,
      salesByCategory: sales?.salesByCategory || {},
      salesByPaymentMethod: sales?.salesByPaymentMethod || {},
    };
  }

  async getInventoryValuation(): Promise<InventoryValuationSummary> {
    const raw: any = await apiClient.get('/reports/inventory').catch(() => ({}));
    return {
      totalSkus: raw.totalSkus || raw.totalItems || 0,
      totalUnitsOnHand: raw.totalUnitsOnHand || raw.totalQuantity || 0,
      totalCostValue: raw.totalCostValue || raw.valuation?.costValue || 0,
      totalRetailValue: raw.totalRetailValue || raw.valuation?.retailValue || 0,
      potentialGrossProfit: raw.potentialGrossProfit || raw.valuation?.potentialProfit || 0,
      grossMarginPercent: raw.grossMarginPercent || 35,
    };
  }

  async getTopSellingProducts(limit: number = 5): Promise<Array<{
    productName: string;
    brand: string;
    unitsSold: number;
    revenue: number;
  }>> {
    const raw: any = await apiClient.get('/reports/sales', { limit }).catch(() => ({}));
    return raw?.topSellingProducts || [];
  }

  async getBookingStats(): Promise<{
    totalBookings: number;
    appointments: number;
    reservations: number;
    completed: number;
    cancelled: number;
    readyForPickup: number;
  }> {
    const bookings: any = await apiClient.get('/bookings').catch(() => []);
    const list = Array.isArray(bookings) ? bookings : [];
    return {
      totalBookings: list.length,
      appointments: list.filter((b: any) => b.bookingType === 'appointment' || b.bookingType === 'Optometry_Exam').length,
      reservations: list.filter((b: any) => b.bookingType === 'reservation' || b.bookingType === 'Frame_Trial').length,
      completed: list.filter((b: any) => b.status === 'Completed').length,
      cancelled: list.filter((b: any) => b.status === 'Cancelled').length,
      readyForPickup: list.filter((b: any) => b.status === 'Ready_For_Pickup' || b.status === 'Ready').length,
    };
  }

  async getDashboardKpis(): Promise<any> {
    return apiClient.get('/reports/dashboard');
  }

  async getSalesOverview(range: string = '30d'): Promise<any> {
    return apiClient.get('/reports/sales', { range });
  }

  async getCategoryBreakdown(): Promise<any> {
    return apiClient.get('/reports/sales');
  }
}

export class ApiStaffService implements StaffService {
  async listStaff(): Promise<StaffMember[]> {
    const raw: any = await apiClient.get('/staff');
    return Array.isArray(raw) ? raw : raw?.items || [];
  }

  async getStaffById(id: string): Promise<StaffMember> {
    return apiClient.get<StaffMember>(`/staff/${id}`);
  }

  async getById(id: string): Promise<StaffMember> {
    return this.getStaffById(id);
  }

  async createStaff(input: Omit<StaffMember, 'id' | 'employeeCode' | 'lastLogin' | 'joinedDate'>): Promise<StaffMember> {
    return apiClient.post<StaffMember>('/staff', input);
  }

  async create(input: any): Promise<StaffMember> {
    return this.createStaff(input);
  }

  async updateStaff(id: string, input: Partial<StaffMember>): Promise<StaffMember> {
    return apiClient.patch<StaffMember>(`/staff/${id}`, input);
  }

  async update(id: string, input: any): Promise<StaffMember> {
    return this.updateStaff(id, input);
  }

  async delete(id: string): Promise<boolean> {
    await apiClient.delete(`/staff/${id}`);
    return true;
  }

  async getRoles(): Promise<RoleDefinition[]> {
    const res: any = await apiClient.get('/roles');
    return res.roles || res || [];
  }

  async listRoleDefinitions(): Promise<RoleDefinition[]> {
    return this.getRoles();
  }

  async getSettings(): Promise<StoreSettings> {
    return apiClient.get<StoreSettings>('/settings');
  }

  async updateSettings(input: Partial<StoreSettings>): Promise<StoreSettings> {
    return apiClient.patch<StoreSettings>('/settings', input);
  }

  async listAuditLogs(params: { search?: string; entity?: string; action?: string } = {}): Promise<AuditLogEntry[]> {
    const raw: any = await apiClient.get('/audit-logs', params);
    return Array.isArray(raw) ? raw : raw?.items || [];
  }
}

export class ApiNotificationService {
  async list(params: any = {}): Promise<any[]> {
    const raw: any = await apiClient.get('/notifications', params);
    return Array.isArray(raw) ? raw : raw?.items || [];
  }

  async retry(id: string): Promise<any> {
    return apiClient.post(`/notifications/${id}/retry`);
  }

  async delete(id: string): Promise<boolean> {
    return true;
  }
}

// Singleton Real API instances
export const apiProductService = new ApiProductService();
export const apiSalesService = new ApiSalesService();
export const apiCustomerService = new ApiCustomerService();
export const apiBookingService = new ApiBookingService();
export const apiInventoryService = new ApiInventoryService();
export const apiSupplierService = new ApiSupplierService();
export const apiPurchaseOrderService = new ApiPurchaseOrderService();
export const apiOfferService = new ApiOfferService();
export const apiReportService = new ApiReportService();
export const apiStaffService = new ApiStaffService();
export const apiNotificationService = new ApiNotificationService();

