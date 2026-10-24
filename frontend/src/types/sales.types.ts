export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Split' | 'Other';

export type SaleStatus = 'Completed' | 'Refunded' | 'Partially_Refunded' | 'Cancelled';

export interface SaleItem {
  id: string;
  variantId: string;
  variantSku: string;
  productName: string;
  brand: string;
  colorName: string;
  size: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  taxableAmount: number;
  total: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string; // e.g. "INV-2026-9041"
  customer?: {
    id?: string;
    name: string;
    phone: string;
    email?: string;
  };
  items: SaleItem[];
  subtotal: number;
  discountTotal: number;
  appliedCoupon?: string;
  taxRatePercent: number; // e.g. 12% GST on optical goods in India
  taxTotal: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  amountReceived?: number;
  changeGiven?: number;
  transactionReference?: string;
  status: SaleStatus;
  cashierName: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleReturnItem {
  saleItemId: string;
  variantId: string;
  productName: string;
  variantSku: string;
  returnedQuantity: number;
  unitPrice: number;
  refundAmount: number;
  restockStock: boolean;
  reason: 'Fitting Issue' | 'Prescription Mismatch' | 'Defect' | 'Customer Changed Mind' | 'Other';
}

export interface SaleReturn {
  id: string;
  returnNumber: string;
  saleId: string;
  invoiceNumber: string;
  customerName: string;
  refundMethod: PaymentMethod;
  items: SaleReturnItem[];
  totalRefund: number;
  processedBy: string;
  createdAt: string;
}
