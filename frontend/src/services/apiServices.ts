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
    return apiClient.get<PaginatedResult<Product>>('/products', params);
  }

  async getById(id: string): Promise<Product> {
    return apiClient.get<Product>(`/products/${id}`);
  }

  async getBySlug(slug: string): Promise<Product> {
    return apiClient.get<Product>(`/products/slug/${slug}`);
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
    return apiClient.get<Sale[]>('/sales', params);
  }

  async getById(id: string): Promise<Sale> {
    return apiClient.get<Sale>(`/sales/${id}`);
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
    return apiClient.get<SaleReturn[]>('/sales/returns');
  }
}

export class ApiCustomerService implements CustomerService {
  async list(params: { search?: string; page?: number; pageSize?: number } = {}): Promise<PaginatedResult<Customer>> {
    return apiClient.get<PaginatedResult<Customer>>('/customers', params);
  }

  async getById(id: string): Promise<Customer> {
    return apiClient.get<Customer>(`/customers/${id}`);
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
    return apiClient.get<Sale[]>(`/customers/${id}/sales`);
  }

  async getCustomerBookings(id: string): Promise<Booking[]> {
    return apiClient.get<Booking[]>(`/customers/${id}/bookings`);
  }
}

export class ApiBookingService implements BookingService {
  async list(params: { bookingType?: string; status?: string; date?: string; search?: string } = {}): Promise<Booking[]> {
    return apiClient.get<Booking[]>('/bookings', params);
  }

  async getById(id: string): Promise<Booking> {
    return apiClient.get<Booking>(`/bookings/${id}`);
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
  async list(params: { search?: string; lowStockOnly?: boolean; page?: number; pageSize?: number } = {}): Promise<any> {
    return apiClient.get('/inventory', params);
  }

  async getById(variantId: string): Promise<any> {
    return apiClient.get(`/inventory/${variantId}`);
  }

  async listMovements(params: { variantId?: string; movementType?: string; search?: string; page?: number; pageSize?: number } = {}): Promise<any> {
    return apiClient.get('/inventory/movements', params);
  }

  async adjustStock(input: StockAdjustmentInput): Promise<{ variant: any; movement: StockMovement }> {
    return apiClient.post('/inventory/adjustments', input);
  }

  async listStockRequests(): Promise<StockRequest[]> {
    return apiClient.get<StockRequest[]>('/inventory/requests');
  }

  async createStockRequest(input: any): Promise<StockRequest> {
    return apiClient.post<StockRequest>('/inventory/requests', input);
  }

  async updateStockRequestStatus(id: string, status: any, approverNotes?: string): Promise<StockRequest> {
    return apiClient.patch<StockRequest>(`/inventory/requests/${id}/approve`, { notes: approverNotes });
  }

  async listStocktakes(): Promise<StocktakeSession[]> {
    return apiClient.get<StocktakeSession[]>('/inventory/counts');
  }

  async createStocktake(input: any): Promise<StocktakeSession> {
    return apiClient.post<StocktakeSession>('/inventory/counts', input);
  }

  async completeStocktake(id: string, reconcileInventory: boolean = true): Promise<StocktakeSession> {
    return apiClient.post<StocktakeSession>(`/inventory/counts/${id}/complete`, { reconcileInventory });
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
  async list(params: { status?: string; search?: string } = {}): Promise<PurchaseOrder[]> {
    return apiClient.get<PurchaseOrder[]>('/purchase-orders', params);
  }

  async getById(id: string): Promise<PurchaseOrder> {
    return apiClient.get<PurchaseOrder>(`/purchase-orders/${id}`);
  }

  async create(input: any): Promise<PurchaseOrder> {
    return apiClient.post<PurchaseOrder>('/purchase-orders', input);
  }

  async submit(id: string): Promise<PurchaseOrder> {
    return apiClient.post<PurchaseOrder>(`/purchase-orders/${id}/submit`);
  }

  async receiveGoods(input: any): Promise<GoodsReceipt> {
    return apiClient.post<GoodsReceipt>('/goods-receipts', input);
  }

  async listGoodsReceipts(): Promise<GoodsReceipt[]> {
    return apiClient.get<GoodsReceipt[]>('/goods-receipts');
  }
}

export class ApiOfferService implements OfferService {
  async listOffers(activeOnly: boolean = false): Promise<Offer[]> {
    return apiClient.get<Offer[]>('/offers', { activeOnly });
  }

  async listCoupons(): Promise<Coupon[]> {
    return apiClient.get<Coupon[]>('/coupons');
  }

  async validateCoupon(code: string, subtotal: number, customerPhone?: string): Promise<any> {
    return apiClient.post('/coupons/validate', { code, subtotal, customerPhone });
  }

  async createOffer(input: any): Promise<Offer> {
    return apiClient.post<Offer>('/offers', input);
  }
}

export class ApiReportService implements ReportService {
  async getDashboardKpis(): Promise<any> {
    return apiClient.get('/reports/dashboard');
  }

  async getSalesOverview(range: string = '30d'): Promise<any> {
    return apiClient.get('/reports/sales', { range });
  }

  async getInventoryValuation(): Promise<any> {
    return apiClient.get('/reports/inventory');
  }

  async getTopSellingProducts(limit: number = 5): Promise<any> {
    return apiClient.get('/reports/sales', { limit });
  }

  async getCategoryBreakdown(): Promise<any> {
    return apiClient.get('/reports/sales');
  }
}

export class ApiStaffService implements StaffService {
  async listStaff(): Promise<StaffMember[]> {
    return apiClient.get<StaffMember[]>('/staff');
  }

  async getById(id: string): Promise<StaffMember> {
    return apiClient.get<StaffMember>(`/staff/${id}`);
  }

  async create(input: any): Promise<StaffMember> {
    return apiClient.post<StaffMember>('/staff', input);
  }

  async update(id: string, input: any): Promise<StaffMember> {
    return apiClient.patch<StaffMember>(`/staff/${id}`, input);
  }

  async delete(id: string): Promise<boolean> {
    await apiClient.delete(`/staff/${id}`);
    return true;
  }

  async listRoleDefinitions(): Promise<RoleDefinition[]> {
    const res: any = await apiClient.get('/roles');
    return res.roles || [];
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
