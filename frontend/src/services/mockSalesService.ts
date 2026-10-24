import { Sale, SaleItem, SaleReturn, SaleReturnItem } from '../types/sales.types';
import { generateInvoiceNumber } from '../utils/formatting';
import { mockStore, simulateNetwork } from './mockApiClient';

export interface CreateSaleInput {
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  items: Array<{
    variantId: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }>;
  appliedCoupon?: string;
  discountTotal: number;
  paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Split' | 'Other';
  amountReceived?: number;
  transactionReference?: string;
  cashierName?: string;
  notes?: string;
}

export interface SalesService {
  list(params?: { search?: string; status?: string; paymentMethod?: string; date?: string }): Promise<Sale[]>;
  getById(id: string): Promise<Sale>;
  createSale(input: CreateSaleInput): Promise<Sale>;
  processReturn(
    saleId: string,
    refundMethod: 'Cash' | 'UPI' | 'Card' | 'Split' | 'Other',
    items: Array<{
      saleItemId: string;
      variantId: string;
      returnedQuantity: number;
      reason: 'Fitting Issue' | 'Prescription Mismatch' | 'Defect' | 'Customer Changed Mind' | 'Other';
      restockStock: boolean;
    }>,
    processedBy?: string
  ): Promise<SaleReturn>;
  listReturns(): Promise<SaleReturn[]>;
}

class MockSalesServiceImpl implements SalesService {
  async list(params = {} as { search?: string; status?: string; paymentMethod?: string; date?: string }): Promise<Sale[]> {
    let list = [...mockStore.sales];

    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (s) =>
          s.invoiceNumber.toLowerCase().includes(q) ||
          (s.customer?.name && s.customer.name.toLowerCase().includes(q)) ||
          (s.customer?.phone && s.customer.phone.includes(q)) ||
          s.items.some((i) => i.productName.toLowerCase().includes(q) || i.variantSku.toLowerCase().includes(q))
      );
    }

    if (params.status && params.status !== 'all') {
      list = list.filter((s) => s.status === params.status);
    }

    if (params.paymentMethod && params.paymentMethod !== 'all') {
      list = list.filter((s) => s.paymentMethod === params.paymentMethod);
    }

    if (params.date) {
      list = list.filter((s) => s.createdAt.startsWith(params.date!));
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return simulateNetwork(list);
  }

  async getById(id: string): Promise<Sale> {
    const sale = mockStore.sales.find((s) => s.id === id);
    if (!sale) throw new Error(`Sale ${id} not found`);
    return simulateNetwork(sale);
  }

  async createSale(input: CreateSaleInput): Promise<Sale> {
    if (!input.items || input.items.length === 0) {
      throw new Error('Cannot create a sale without items');
    }

    const seq = mockStore.sales.length + 1;
    const invoiceNumber = generateInvoiceNumber(seq);
    const id = `sale-${Date.now()}`;

    let subtotal = 0;
    const saleItems: SaleItem[] = [];

    // Map each item and update inventory
    for (const itemInput of input.items) {
      let foundProduct: any = null;
      let foundVariant: any = null;

      for (const p of mockStore.products) {
        const v = p.variants.find((vr) => vr.id === itemInput.variantId);
        if (v) {
          foundProduct = p;
          foundVariant = v;
          break;
        }
      }

      if (!foundVariant || !foundProduct) {
        throw new Error(`Variant ${itemInput.variantId} not found in catalog`);
      }

      const itemDiscount = itemInput.discount || 0;
      const lineTaxable = itemInput.unitPrice * itemInput.quantity - itemDiscount;
      subtotal += itemInput.unitPrice * itemInput.quantity;

      saleItems.push({
        id: `si-${Date.now()}-${saleItems.length + 1}`,
        variantId: foundVariant.id,
        variantSku: foundVariant.variantSku,
        productName: foundProduct.name,
        brand: foundProduct.brand,
        colorName: foundVariant.colorName,
        size: foundVariant.size,
        unitPrice: itemInput.unitPrice,
        quantity: itemInput.quantity,
        discount: itemDiscount,
        taxableAmount: lineTaxable,
        total: lineTaxable,
      });

      // Decrement stockOnHand
      const prevStock = foundVariant.stockOnHand;
      foundVariant.stockOnHand = Math.max(0, foundVariant.stockOnHand - itemInput.quantity);

      // Record stock movement
      mockStore.stockMovements.unshift({
        id: `mov-${Date.now()}-${saleItems.length}`,
        variantId: foundVariant.id,
        variantSku: foundVariant.variantSku,
        productName: foundProduct.name,
        movementType: 'sale',
        quantityDelta: -itemInput.quantity,
        previousStock: prevStock,
        newStock: foundVariant.stockOnHand,
        referenceType: 'sale',
        referenceId: invoiceNumber,
        performedBy: input.cashierName || 'Aman Patel',
        timestamp: new Date().toISOString(),
      });
    }

    const taxRatePercent = mockStore.settings.taxRatePercent || 12;
    const taxableSubtotal = Math.max(0, subtotal - input.discountTotal);
    const taxTotal = parseFloat(((taxableSubtotal * taxRatePercent) / 100).toFixed(2));
    const grandTotal = parseFloat((taxableSubtotal + taxTotal).toFixed(2));

    let changeGiven = 0;
    if (input.paymentMethod === 'Cash' && input.amountReceived) {
      changeGiven = Math.max(0, parseFloat((input.amountReceived - grandTotal).toFixed(2)));
    }

    const newSale: Sale = {
      id,
      invoiceNumber,
      customer: input.customerName
        ? {
            id: input.customerId,
            name: input.customerName,
            phone: input.customerPhone || '',
            email: input.customerEmail,
          }
        : undefined,
      items: saleItems,
      subtotal,
      discountTotal: input.discountTotal,
      appliedCoupon: input.appliedCoupon,
      taxRatePercent,
      taxTotal,
      grandTotal,
      paymentMethod: input.paymentMethod,
      amountReceived: input.amountReceived,
      changeGiven,
      transactionReference: input.transactionReference || (input.paymentMethod === 'UPI' ? `UPI/${Date.now().toString().slice(-10)}` : undefined),
      status: 'Completed',
      cashierName: input.cashierName || 'Aman Patel',
      notes: input.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockStore.sales.unshift(newSale);
    mockStore.save('sales', mockStore.sales);
    mockStore.save('products', mockStore.products);
    mockStore.save('stockMovements', mockStore.stockMovements);

    // If customer is registered, update total spent
    if (input.customerId) {
      const cust = mockStore.customers.find((c) => c.id === input.customerId);
      if (cust) {
        cust.totalSpent += grandTotal;
        cust.totalVisits += 1;
        cust.updatedAt = new Date().toISOString();
        mockStore.save('customers', mockStore.customers);
      }
    }

    // Add audit log
    mockStore.auditLogs.unshift({
      id: `log-${Date.now()}`,
      actorName: input.cashierName || 'Cashier',
      actorRole: 'Cashier',
      action: 'SALE',
      entity: 'Sale',
      entityId: invoiceNumber,
      summary: `Completed sale ${invoiceNumber} for ₹${grandTotal} (${input.paymentMethod})`,
      timestamp: new Date().toISOString(),
    });
    mockStore.save('auditLogs', mockStore.auditLogs);

    return simulateNetwork(newSale);
  }

  async processReturn(
    saleId: string,
    refundMethod: 'Cash' | 'UPI' | 'Card' | 'Split' | 'Other',
    items: Array<{
      saleItemId: string;
      variantId: string;
      returnedQuantity: number;
      reason: 'Fitting Issue' | 'Prescription Mismatch' | 'Defect' | 'Customer Changed Mind' | 'Other';
      restockStock: boolean;
    }>,
    processedBy: string = 'Kavita Joshi (Store Manager)'
  ): Promise<SaleReturn> {
    const sale = mockStore.sales.find((s) => s.id === saleId);
    if (!sale) throw new Error(`Sale ${saleId} not found`);

    let totalRefund = 0;
    const returnItems: SaleReturnItem[] = [];

    for (const retItem of items) {
      const originalItem = sale.items.find((i) => i.id === retItem.saleItemId);
      if (!originalItem) continue;

      const refundLine = originalItem.unitPrice * retItem.returnedQuantity;
      totalRefund += refundLine;

      returnItems.push({
        saleItemId: retItem.saleItemId,
        variantId: retItem.variantId,
        productName: originalItem.productName,
        variantSku: originalItem.variantSku,
        returnedQuantity: retItem.returnedQuantity,
        unitPrice: originalItem.unitPrice,
        refundAmount: refundLine,
        restockStock: retItem.restockStock,
        reason: retItem.reason,
      });

      if (retItem.restockStock) {
        for (const p of mockStore.products) {
          const v = p.variants.find((vr) => vr.id === retItem.variantId);
          if (v) {
            const prev = v.stockOnHand;
            v.stockOnHand += retItem.returnedQuantity;
            mockStore.stockMovements.unshift({
              id: `mov-${Date.now()}`,
              variantId: v.id,
              variantSku: v.variantSku,
              productName: originalItem.productName,
              movementType: 'return',
              quantityDelta: retItem.returnedQuantity,
              previousStock: prev,
              newStock: v.stockOnHand,
              referenceType: 'sale',
              referenceId: sale.invoiceNumber,
              reason: `Customer return restocked: ${retItem.reason}`,
              performedBy: processedBy,
              timestamp: new Date().toISOString(),
            });
            break;
          }
        }
      }
    }

    const seq = mockStore.returns.length + 1;
    const returnNumber = `RET-2026-${String(seq).padStart(4, '0')}`;

    const newReturn: SaleReturn = {
      id: `ret-${Date.now()}`,
      returnNumber,
      saleId: sale.id,
      invoiceNumber: sale.invoiceNumber,
      customerName: sale.customer?.name || 'Walk-in Guest',
      refundMethod,
      items: returnItems,
      totalRefund,
      processedBy,
      createdAt: new Date().toISOString(),
    };

    sale.status = 'Refunded';
    sale.updatedAt = new Date().toISOString();

    mockStore.returns.unshift(newReturn);
    mockStore.save('returns', mockStore.returns);
    mockStore.save('sales', mockStore.sales);
    mockStore.save('products', mockStore.products);
    mockStore.save('stockMovements', mockStore.stockMovements);

    mockStore.auditLogs.unshift({
      id: `log-${Date.now()}`,
      actorName: processedBy,
      actorRole: 'Store Manager',
      action: 'UPDATE',
      entity: 'Sale',
      entityId: sale.invoiceNumber,
      summary: `Processed return ${returnNumber} for invoice ${sale.invoiceNumber} (Refund: ₹${totalRefund})`,
      timestamp: new Date().toISOString(),
    });
    mockStore.save('auditLogs', mockStore.auditLogs);

    return simulateNetwork(newReturn);
  }

  async listReturns(): Promise<SaleReturn[]> {
    return simulateNetwork([...mockStore.returns]);
  }
}

import { apiSalesService } from './apiServices';

const isMock = (import.meta as any).env?.VITE_DATA_MODE === 'mock';
export const mockSalesService: SalesService = isMock ? new MockSalesServiceImpl() : apiSalesService;
