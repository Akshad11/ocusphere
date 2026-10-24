export type PurchaseOrderStatus =
  | 'Draft'
  | 'Sent'
  | 'Partially_Received'
  | 'Received'
  | 'Cancelled';

export interface PurchaseOrderItem {
  id: string;
  variantId: string;
  variantSku: string;
  productName: string;
  orderedQuantity: number;
  receivedQuantity: number;
  unitCost: number;
  totalCost: number;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string; // e.g. "PO-2026-0301"
  supplierId: string;
  supplierName: string;
  status: PurchaseOrderStatus;
  orderDate: string;
  expectedDeliveryDate: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  taxAmount: number;
  totalCost: number;
  notes?: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoodsReceiptItem {
  purchaseOrderItemId: string;
  variantId: string;
  variantSku: string;
  productName: string;
  orderedQuantity: number;
  previouslyReceived: number;
  receivedNow: number;
  damagedOrMissing: number;
  unitCost: number;
}

export interface GoodsReceipt {
  id: string;
  receiptNumber: string; // e.g. "GRN-2026-0129"
  purchaseOrderId: string;
  orderNumber: string;
  supplierName: string;
  deliveryNoteNumber?: string;
  receivedDate: string;
  items: GoodsReceiptItem[];
  receivedBy: string;
  notes?: string;
}
