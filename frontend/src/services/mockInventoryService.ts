import { StockAdjustmentInput, StockMovement, StockRequest, StocktakeSession } from '../types/inventory.types';
import { mockStore, simulateNetwork } from './mockApiClient';

export interface InventoryItemRow {
  variantId: string;
  productId: string;
  productName: string;
  brand: string;
  category: string;
  productType: string;
  variantSku: string;
  barcode: string;
  colorName: string;
  size: string;
  sellingPrice: number;
  costPrice: number;
  stockOnHand: number;
  reservedQuantity: number;
  availableQuantity: number;
  reorderLevel: number;
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
  lastMovementDate: string;
}

export interface InventoryService {
  listStock(params?: {
    search?: string;
    stockStatus?: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
    productType?: string;
  }): Promise<InventoryItemRow[]>;
  getMovements(variantId?: string): Promise<StockMovement[]>;
  adjustStock(input: StockAdjustmentInput, performedBy?: string): Promise<StockMovement>;
  getStockRequests(): Promise<StockRequest[]>;
  createStockRequest(input: Omit<StockRequest, 'id' | 'requestNumber' | 'createdAt' | 'updatedAt'>): Promise<StockRequest>;
  updateStockRequestStatus(id: string, status: StockRequest['status'], approverNotes?: string, approvedBy?: string): Promise<StockRequest>;
  getStocktakes(): Promise<StocktakeSession[]>;
  saveStocktake(session: StocktakeSession): Promise<StocktakeSession>;
}

class MockInventoryServiceImpl implements InventoryService {
  async listStock(params = {} as { search?: string; stockStatus?: string; productType?: string }): Promise<InventoryItemRow[]> {
    const rows: InventoryItemRow[] = [];

    mockStore.products.forEach((product) => {
      product.variants.forEach((variant) => {
        const available = variant.stockOnHand - variant.reservedQuantity;
        let stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
        if (available <= 0) {
          stockStatus = 'Out of Stock';
        } else if (available <= variant.reorderLevel) {
          stockStatus = 'Low Stock';
        }

        // find last movement
        const lastMov = mockStore.stockMovements
          .filter((m) => m.variantId === variant.id)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

        rows.push({
          variantId: variant.id,
          productId: product.id,
          productName: product.name,
          brand: product.brand,
          category: product.category,
          productType: product.productType,
          variantSku: variant.variantSku,
          barcode: variant.barcode,
          colorName: variant.colorName,
          size: variant.size,
          sellingPrice: variant.sellingPrice,
          costPrice: variant.costPrice,
          stockOnHand: variant.stockOnHand,
          reservedQuantity: variant.reservedQuantity,
          availableQuantity: available,
          reorderLevel: variant.reorderLevel,
          stockStatus,
          lastMovementDate: lastMov ? lastMov.timestamp : product.updatedAt,
        });
      });
    });

    let filtered = rows;
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.productName.toLowerCase().includes(q) ||
          r.variantSku.toLowerCase().includes(q) ||
          r.barcode.includes(q) ||
          r.brand.toLowerCase().includes(q)
      );
    }

    if (params.stockStatus && params.stockStatus !== 'all') {
      if (params.stockStatus === 'low_stock') {
        filtered = filtered.filter((r) => r.stockStatus === 'Low Stock');
      } else if (params.stockStatus === 'out_of_stock') {
        filtered = filtered.filter((r) => r.stockStatus === 'Out of Stock');
      } else if (params.stockStatus === 'in_stock') {
        filtered = filtered.filter((r) => r.stockStatus === 'In Stock');
      }
    }

    if (params.productType && params.productType !== 'all') {
      filtered = filtered.filter((r) => r.productType === params.productType);
    }

    return simulateNetwork(filtered);
  }

  async getMovements(variantId?: string): Promise<StockMovement[]> {
    let list = [...mockStore.stockMovements];
    if (variantId) {
      list = list.filter((m) => m.variantId === variantId);
    }
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return simulateNetwork(list);
  }

  async adjustStock(input: StockAdjustmentInput, performedBy: string = 'Store Manager'): Promise<StockMovement> {
    // Find variant
    let targetVariant: any = null;
    let targetProduct: any = null;

    for (const prod of mockStore.products) {
      const v = prod.variants.find((variant) => variant.id === input.variantId);
      if (v) {
        targetVariant = v;
        targetProduct = prod;
        break;
      }
    }

    if (!targetVariant) {
      throw new Error(`Variant ${input.variantId} not found`);
    }

    const previousStock = targetVariant.stockOnHand;
    let newStock = previousStock;
    let quantityDelta = 0;

    if (input.adjustmentType === 'add') {
      quantityDelta = Math.abs(input.quantity);
      newStock = previousStock + quantityDelta;
    } else if (input.adjustmentType === 'subtract') {
      quantityDelta = -Math.abs(input.quantity);
      newStock = Math.max(0, previousStock + quantityDelta);
    } else {
      // 'set'
      newStock = Math.max(0, input.quantity);
      quantityDelta = newStock - previousStock;
    }

    targetVariant.stockOnHand = newStock;
    mockStore.save('products', mockStore.products);

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      variantId: targetVariant.id,
      variantSku: targetVariant.variantSku,
      productName: targetProduct.name,
      movementType: quantityDelta >= 0 ? 'adjustment_in' : 'adjustment_out',
      quantityDelta,
      previousStock,
      newStock,
      referenceType: 'adjustment',
      referenceId: `ADJ-${Date.now().toString().slice(-4)}`,
      reason: `${input.reason}${input.notes ? ` - ${input.notes}` : ''}`,
      performedBy,
      timestamp: new Date().toISOString(),
    };

    mockStore.stockMovements.unshift(movement);
    mockStore.save('stockMovements', mockStore.stockMovements);

    mockStore.auditLogs.unshift({
      id: `log-${Date.now()}`,
      actorName: performedBy,
      actorRole: 'Store Manager',
      action: 'ADJUST',
      entity: 'Inventory',
      entityId: targetVariant.variantSku,
      summary: `Manual stock adjustment ${quantityDelta > 0 ? '+' : ''}${quantityDelta} for ${targetProduct.name} (${input.reason})`,
      timestamp: new Date().toISOString(),
    });
    mockStore.save('auditLogs', mockStore.auditLogs);

    return simulateNetwork(movement);
  }

  async getStockRequests(): Promise<StockRequest[]> {
    const list = [...mockStore.stockRequests].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return simulateNetwork(list);
  }

  async createStockRequest(
    input: Omit<StockRequest, 'id' | 'requestNumber' | 'createdAt' | 'updatedAt'>
  ): Promise<StockRequest> {
    const seq = mockStore.stockRequests.length + 1;
    const requestNumber = `SR-2026-${String(seq).padStart(3, '0')}`;
    const newReq: StockRequest = {
      ...input,
      id: `sr-${Date.now()}`,
      requestNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockStore.stockRequests.unshift(newReq);
    mockStore.save('stockRequests', mockStore.stockRequests);

    // Also trigger notification
    mockStore.notifications.unshift({
      id: `notif-${Date.now()}`,
      channel: 'In-App System',
      recipient: 'storemanager@ocusphere.in',
      recipientName: 'Store Management Queue',
      template: 'Stock Request Submitted',
      title: `Stock Request ${requestNumber} Submitted`,
      messageContent: `${input.requestedBy} submitted new stock request (${input.urgency}) with ${input.items.length} items.`,
      status: 'Delivered',
      attemptCount: 1,
      lastAttemptAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    mockStore.save('notifications', mockStore.notifications);

    return simulateNetwork(newReq);
  }

  async updateStockRequestStatus(
    id: string,
    status: StockRequest['status'],
    approverNotes?: string,
    approvedBy: string = 'Rajiv Singhal (Owner/Admin)'
  ): Promise<StockRequest> {
    const req = mockStore.stockRequests.find((r) => r.id === id);
    if (!req) {
      throw new Error(`Stock request ${id} not found`);
    }

    req.status = status;
    req.approverNotes = approverNotes || req.approverNotes;
    req.approvedBy = approvedBy;
    req.updatedAt = new Date().toISOString();

    mockStore.save('stockRequests', mockStore.stockRequests);

    mockStore.notifications.unshift({
      id: `notif-${Date.now()}`,
      channel: 'In-App System',
      recipient: 'inventory-ops@ocusphere.in',
      recipientName: req.requestedBy,
      template: status === 'Approved' ? 'Stock Request Approval' : 'Stock Request Rejection',
      title: `Stock Request ${req.requestNumber} ${status}`,
      messageContent: `Request ${req.requestNumber} was marked as ${status} by ${approvedBy}.${approverNotes ? ` Note: ${approverNotes}` : ''}`,
      status: 'Delivered',
      attemptCount: 1,
      lastAttemptAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    mockStore.save('notifications', mockStore.notifications);

    return simulateNetwork(req);
  }

  async getStocktakes(): Promise<StocktakeSession[]> {
    return simulateNetwork([...mockStore.stocktakes]);
  }

  async saveStocktake(session: StocktakeSession): Promise<StocktakeSession> {
    const idx = mockStore.stocktakes.findIndex((s) => s.id === session.id);
    if (idx !== -1) {
      mockStore.stocktakes[idx] = session;
    } else {
      mockStore.stocktakes.unshift(session);
    }
    mockStore.save('stocktakes', mockStore.stocktakes);
    return simulateNetwork(session);
  }
}

import { apiInventoryService } from './apiServices';

const isMock = (import.meta as any).env?.VITE_DATA_MODE === 'mock';
export const mockInventoryService: InventoryService = isMock ? new MockInventoryServiceImpl() : (apiInventoryService as any);
