export type StockMovementType =
  | 'sale'
  | 'purchase_receipt'
  | 'adjustment_in'
  | 'adjustment_out'
  | 'return'
  | 'reservation_hold'
  | 'reservation_release';

export type StockRequestStatus =
  | 'Draft'
  | 'Submitted'
  | 'Approved'
  | 'Rejected'
  | 'Ordered'
  | 'Received'
  | 'Cancelled';

export interface StockMovement {
  id: string;
  variantId: string;
  variantSku: string;
  productName: string;
  movementType: StockMovementType;
  quantityDelta: number; // positive or negative
  previousStock: number;
  newStock: number;
  referenceType: 'sale' | 'po' | 'adjustment' | 'booking' | 'stocktake';
  referenceId: string;
  reason?: string;
  performedBy: string;
  timestamp: string;
}

export interface StockAdjustmentInput {
  variantId: string;
  adjustmentType: 'add' | 'subtract' | 'set';
  quantity: number;
  reason: 'Damaged' | 'Cycle Count Discrepancy' | 'Store Sample' | 'Customer Return' | 'Supplier Correction' | 'Other';
  notes?: string;
}

export interface StockRequestItem {
  id: string;
  variantId: string;
  variantSku: string;
  productName: string;
  currentStock: number;
  requestedQuantity: number;
  approvedQuantity?: number;
  estimatedCost: number;
}

export interface StockRequest {
  id: string;
  requestNumber: string;
  requestedBy: string;
  status: StockRequestStatus;
  urgency: 'Standard' | 'Urgent' | 'Critical';
  items: StockRequestItem[];
  notes?: string;
  approverNotes?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StocktakeItem {
  variantId: string;
  variantSku: string;
  productName: string;
  systemStock: number;
  countedStock: number;
  variance: number;
  unitCost: number;
}

export interface StocktakeSession {
  id: string;
  reference: string;
  categoryOrBrand: string;
  startedAt: string;
  completedAt?: string;
  status: 'In Progress' | 'Completed' | 'Reconciled';
  auditedBy: string;
  items: StocktakeItem[];
  totalVarianceCount: number;
  totalVarianceValue: number;
}
