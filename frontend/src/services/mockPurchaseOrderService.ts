import { GoodsReceipt, GoodsReceiptItem, PurchaseOrder, PurchaseOrderItem } from '../types/purchasing.types';
import { mockStore, simulateNetwork } from './mockApiClient';

export interface CreatePurchaseOrderInput {
  supplierId: string;
  expectedDeliveryDate: string;
  notes?: string;
  createdByName?: string;
  items: Array<{
    variantId: string;
    orderedQuantity: number;
    unitCost: number;
  }>;
}

export interface ConfirmGoodsReceiptInput {
  purchaseOrderId: string;
  deliveryNoteNumber?: string;
  receivedBy: string;
  notes?: string;
  items: Array<{
    purchaseOrderItemId: string;
    variantId: string;
    receivedNow: number;
    damagedOrMissing: number;
  }>;
}

export interface PurchaseOrderService {
  list(params?: { search?: string; status?: string; supplierId?: string }): Promise<PurchaseOrder[]>;
  getById(id: string): Promise<PurchaseOrder>;
  create(input: CreatePurchaseOrderInput): Promise<PurchaseOrder>;
  confirmGoodsReceipt(input: ConfirmGoodsReceiptInput): Promise<GoodsReceipt>;
  listGoodsReceipts(): Promise<GoodsReceipt[]>;
}

class MockPurchaseOrderServiceImpl implements PurchaseOrderService {
  async list(params = {} as { search?: string; status?: string; supplierId?: string }): Promise<PurchaseOrder[]> {
    let list = [...mockStore.purchaseOrders];

    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (po) =>
          po.orderNumber.toLowerCase().includes(q) ||
          po.supplierName.toLowerCase().includes(q) ||
          po.items.some((i) => i.productName.toLowerCase().includes(q) || i.variantSku.toLowerCase().includes(q))
      );
    }

    if (params.status && params.status !== 'all') {
      list = list.filter((po) => po.status === params.status);
    }

    if (params.supplierId) {
      list = list.filter((po) => po.supplierId === params.supplierId);
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return simulateNetwork(list);
  }

  async getById(id: string): Promise<PurchaseOrder> {
    const po = mockStore.purchaseOrders.find((p) => p.id === id);
    if (!po) throw new Error(`Purchase order ${id} not found`);
    return simulateNetwork(po);
  }

  async create(input: CreatePurchaseOrderInput): Promise<PurchaseOrder> {
    const supp = mockStore.suppliers.find((s) => s.id === input.supplierId);
    if (!supp) throw new Error(`Supplier ${input.supplierId} not found`);

    const seq = mockStore.purchaseOrders.length + 301;
    const orderNumber = `PO-2026-${String(seq).padStart(4, '0')}`;
    const id = `po-${Date.now()}`;

    let subtotal = 0;
    const poItems: PurchaseOrderItem[] = [];

    input.items.forEach((item, idx) => {
      let foundProd: any = null;
      let foundVar: any = null;

      for (const p of mockStore.products) {
        const v = p.variants.find((variant) => variant.id === item.variantId);
        if (v) {
          foundProd = p;
          foundVar = v;
          break;
        }
      }

      const totalLine = item.orderedQuantity * item.unitCost;
      subtotal += totalLine;

      poItems.push({
        id: `poi-${Date.now()}-${idx + 1}`,
        variantId: item.variantId,
        variantSku: foundVar ? foundVar.variantSku : 'SKU-UNKNOWN',
        productName: foundProd ? foundProd.name : 'Unknown Product',
        orderedQuantity: item.orderedQuantity,
        receivedQuantity: 0,
        unitCost: item.unitCost,
        totalCost: totalLine,
      });
    });

    const taxAmount = parseFloat(((subtotal * 12) / 100).toFixed(2));
    const totalCost = parseFloat((subtotal + taxAmount).toFixed(2));

    const newPO: PurchaseOrder = {
      id,
      orderNumber,
      supplierId: supp.id,
      supplierName: supp.businessName,
      status: 'Sent',
      orderDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: input.expectedDeliveryDate,
      items: poItems,
      subtotal,
      taxAmount,
      totalCost,
      notes: input.notes,
      createdByName: input.createdByName || 'Kavita Joshi',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockStore.purchaseOrders.unshift(newPO);
    mockStore.save('purchaseOrders', mockStore.purchaseOrders);

    mockStore.auditLogs.unshift({
      id: `log-${Date.now()}`,
      actorName: input.createdByName || 'Store Manager',
      actorRole: 'Store Manager',
      action: 'CREATE',
      entity: 'PurchaseOrder',
      entityId: orderNumber,
      summary: `Created and sent Purchase Order ${orderNumber} to ${supp.businessName} (₹${totalCost})`,
      timestamp: new Date().toISOString(),
    });
    mockStore.save('auditLogs', mockStore.auditLogs);

    return simulateNetwork(newPO);
  }

  async confirmGoodsReceipt(input: ConfirmGoodsReceiptInput): Promise<GoodsReceipt> {
    const po = mockStore.purchaseOrders.find((p) => p.id === input.purchaseOrderId);
    if (!po) throw new Error(`Purchase order ${input.purchaseOrderId} not found`);

    const seq = mockStore.goodsReceipts.length + 131;
    const receiptNumber = `GRN-2026-${String(seq).padStart(4, '0')}`;
    const id = `grn-${Date.now()}`;

    const receiptItems: GoodsReceiptItem[] = [];

    // Process each item and only update mock inventory here
    for (const item of input.items) {
      const poItem = po.items.find((i) => i.id === item.purchaseOrderItemId);
      if (!poItem) continue;

      const previouslyReceived = poItem.receivedQuantity;
      poItem.receivedQuantity += item.receivedNow;

      receiptItems.push({
        purchaseOrderItemId: item.purchaseOrderItemId,
        variantId: item.variantId,
        variantSku: poItem.variantSku,
        productName: poItem.productName,
        orderedQuantity: poItem.orderedQuantity,
        previouslyReceived,
        receivedNow: item.receivedNow,
        damagedOrMissing: item.damagedOrMissing,
        unitCost: poItem.unitCost,
      });

      // Update mock inventory
      if (item.receivedNow > 0) {
        for (const prod of mockStore.products) {
          const v = prod.variants.find((variant) => variant.id === item.variantId);
          if (v) {
            const prev = v.stockOnHand;
            v.stockOnHand += item.receivedNow;
            // Record movement
            mockStore.stockMovements.unshift({
              id: `mov-${Date.now()}-${receiptItems.length}`,
              variantId: v.id,
              variantSku: v.variantSku,
              productName: poItem.productName,
              movementType: 'purchase_receipt',
              quantityDelta: item.receivedNow,
              previousStock: prev,
              newStock: v.stockOnHand,
              referenceType: 'po',
              referenceId: po.orderNumber,
              reason: `Received via ${receiptNumber}`,
              performedBy: input.receivedBy,
              timestamp: new Date().toISOString(),
            });
            break;
          }
        }
      }
    }

    // Check if PO is fully received
    const allReceived = po.items.every((i) => i.receivedQuantity >= i.orderedQuantity);
    po.status = allReceived ? 'Received' : 'Partially_Received';
    po.updatedAt = new Date().toISOString();

    const newReceipt: GoodsReceipt = {
      id,
      receiptNumber,
      purchaseOrderId: po.id,
      orderNumber: po.orderNumber,
      supplierName: po.supplierName,
      deliveryNoteNumber: input.deliveryNoteNumber,
      receivedDate: new Date().toISOString().split('T')[0],
      items: receiptItems,
      receivedBy: input.receivedBy,
      notes: input.notes,
    };

    mockStore.goodsReceipts.unshift(newReceipt);
    mockStore.save('goodsReceipts', mockStore.goodsReceipts);
    mockStore.save('purchaseOrders', mockStore.purchaseOrders);
    mockStore.save('products', mockStore.products);
    mockStore.save('stockMovements', mockStore.stockMovements);

    mockStore.auditLogs.unshift({
      id: `log-${Date.now()}`,
      actorName: input.receivedBy,
      actorRole: 'Inventory Staff',
      action: 'RECEIPT',
      entity: 'PurchaseOrder',
      entityId: po.orderNumber,
      summary: `Inwarded goods receipt ${receiptNumber} for ${po.orderNumber} from ${po.supplierName}`,
      timestamp: new Date().toISOString(),
    });
    mockStore.save('auditLogs', mockStore.auditLogs);

    return simulateNetwork(newReceipt);
  }

  async listGoodsReceipts(): Promise<GoodsReceipt[]> {
    return simulateNetwork([...mockStore.goodsReceipts]);
  }
}

import { apiPurchaseOrderService } from './apiServices';

const isMock = (import.meta as any).env?.VITE_DATA_MODE === 'mock';
export const mockPurchaseOrderService: PurchaseOrderService = isMock ? new MockPurchaseOrderServiceImpl() : (apiPurchaseOrderService as any);
