import { PurchaseOrder, GoodsReceipt } from '../types/purchasing.types';

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-001',
    orderNumber: 'PO-2026-0301',
    supplierId: 'supp-001',
    supplierName: 'EssilorLuxottica India Pvt Ltd',
    status: 'Received',
    orderDate: '2026-10-10',
    expectedDeliveryDate: '2026-10-15',
    subtotal: 135800,
    taxAmount: 16296,
    totalCost: 152096,
    createdByName: 'Rajiv Singhal',
    notes: 'Q4 Luxury frames & Ray-Ban seasonal replenishment.',
    createdAt: '2026-10-10T10:00:00Z',
    updatedAt: '2026-10-15T12:00:00Z',
    items: [
      {
        id: 'poi-001',
        variantId: 'var-003-1',
        variantSku: 'RB-3025-GLD-GRN-58',
        productName: 'Aviator Classic Polarized (Gold / Green)',
        orderedQuantity: 12,
        receivedQuantity: 12,
        unitCost: 4900,
        totalCost: 58800,
      },
      {
        id: 'poi-002',
        variantId: 'var-004-1',
        variantSku: 'RB-5154-BLK-49',
        productName: 'Clubmaster Square Optical (Black)',
        orderedQuantity: 10,
        receivedQuantity: 10,
        unitCost: 4200,
        totalCost: 42000,
      },
      {
        id: 'poi-003',
        variantId: 'var-024-1',
        variantSku: 'RB-2140-BLK-50',
        productName: 'Wayfarer Classic Polarized',
        orderedQuantity: 6,
        receivedQuantity: 6,
        unitCost: 5800,
        totalCost: 34800,
      }
    ]
  },
  {
    id: 'po-002',
    orderNumber: 'PO-2026-0302',
    supplierId: 'supp-002',
    supplierName: 'Carl Zeiss India (Bangalore) Pvt Ltd',
    status: 'Sent',
    orderDate: '2026-10-21',
    expectedDeliveryDate: '2026-10-27',
    subtotal: 98000,
    taxAmount: 11760,
    totalCost: 109760,
    createdByName: 'Kavita Joshi',
    notes: 'SmartLife Single Vision blanks & cleaning kits for upcoming festive season.',
    createdAt: '2026-10-21T11:30:00Z',
    updatedAt: '2026-10-21T11:45:00Z',
    items: [
      {
        id: 'poi-004',
        variantId: 'var-005-1',
        variantSku: 'ZS-SL-160-PAIR',
        productName: 'Zeiss SmartLife Single Vision 1.60',
        orderedQuantity: 25,
        receivedQuantity: 0,
        unitCost: 2800,
        totalCost: 70000,
      },
      {
        id: 'poi-005',
        variantId: 'var-010-1',
        variantSku: 'ZS-CLN-KIT-60ML',
        productName: 'Precision Optical Cleaning Mist & Microfiber Set',
        orderedQuantity: 100,
        receivedQuantity: 0,
        unitCost: 160,
        totalCost: 16000,
      },
      {
        id: 'poi-006',
        variantId: 'var-005-2',
        variantSku: 'ZS-SL-167-PAIR',
        productName: 'Ultra-Thin Clear AR 1.67',
        orderedQuantity: 3,
        receivedQuantity: 0,
        unitCost: 3800,
        totalCost: 11400,
      }
    ]
  },
  {
    id: 'po-003',
    orderNumber: 'PO-2026-0303',
    supplierId: 'supp-005',
    supplierName: 'Johnson & Johnson Vision Care India',
    status: 'Partially_Received',
    orderDate: '2026-10-18',
    expectedDeliveryDate: '2026-10-23',
    subtotal: 58000,
    taxAmount: 6960,
    totalCost: 64960,
    createdByName: 'Karan Sharma',
    notes: 'Acuvue Oasys regular batch order.',
    createdAt: '2026-10-18T09:00:00Z',
    updatedAt: '2026-10-23T14:00:00Z',
    items: [
      {
        id: 'poi-007',
        variantId: 'var-007-1',
        variantSku: 'JJ-OASYS-BC85-DIA143',
        productName: 'Acuvue Oasys with HydraLuxe Daily (30pk)',
        orderedQuantity: 40,
        receivedQuantity: 25, // 15 pending
        unitCost: 1450,
        totalCost: 58000,
      }
    ]
  },
  {
    id: 'po-004',
    orderNumber: 'PO-2026-0304',
    supplierId: 'supp-006',
    supplierName: 'Hoya Lens India Pvt Ltd',
    status: 'Draft',
    orderDate: '2026-10-24',
    expectedDeliveryDate: '2026-10-31',
    subtotal: 72000,
    taxAmount: 8640,
    totalCost: 80640,
    createdByName: 'Kavita Joshi',
    notes: 'MiYOSMART polycarbonate batch for pediatric clinic pipeline.',
    createdAt: '2026-10-24T08:30:00Z',
    updatedAt: '2026-10-24T08:30:00Z',
    items: [
      {
        id: 'poi-008',
        variantId: 'var-019-1',
        variantSku: 'HY-MIYO-159-POLY',
        productName: 'Hoya MiYOSMART Myopia Management Lens',
        orderedQuantity: 10,
        receivedQuantity: 0,
        unitCost: 7200,
        totalCost: 72000,
      }
    ]
  }
];

export const INITIAL_GOODS_RECEIPTS: GoodsReceipt[] = [
  {
    id: 'grn-001',
    receiptNumber: 'GRN-2026-0129',
    purchaseOrderId: 'po-001',
    orderNumber: 'PO-2026-0301',
    supplierName: 'EssilorLuxottica India Pvt Ltd',
    deliveryNoteNumber: 'DN-LUX-991028',
    receivedDate: '2026-10-15',
    receivedBy: 'Karan Sharma',
    notes: 'All items intact and barcodes matched system catalogue.',
    items: [
      {
        purchaseOrderItemId: 'poi-001',
        variantId: 'var-003-1',
        variantSku: 'RB-3025-GLD-GRN-58',
        productName: 'Aviator Classic Polarized (Gold / Green)',
        orderedQuantity: 12,
        previouslyReceived: 0,
        receivedNow: 12,
        damagedOrMissing: 0,
        unitCost: 4900,
      },
      {
        purchaseOrderItemId: 'poi-002',
        variantId: 'var-004-1',
        variantSku: 'RB-5154-BLK-49',
        productName: 'Clubmaster Square Optical (Black)',
        orderedQuantity: 10,
        previouslyReceived: 0,
        receivedNow: 10,
        damagedOrMissing: 0,
        unitCost: 4200,
      },
      {
        purchaseOrderItemId: 'poi-003',
        variantId: 'var-024-1',
        variantSku: 'RB-2140-BLK-50',
        productName: 'Wayfarer Classic Polarized',
        orderedQuantity: 6,
        previouslyReceived: 0,
        receivedNow: 6,
        damagedOrMissing: 0,
        unitCost: 5800,
      }
    ]
  },
  {
    id: 'grn-002',
    receiptNumber: 'GRN-2026-0130',
    purchaseOrderId: 'po-003',
    orderNumber: 'PO-2026-0303',
    supplierName: 'Johnson & Johnson Vision Care India',
    deliveryNoteNumber: 'DN-JNJ-449182',
    receivedDate: '2026-10-23',
    receivedBy: 'Karan Sharma',
    notes: '25 boxes delivered. 15 remaining on backorder dispatch on Monday.',
    items: [
      {
        purchaseOrderItemId: 'poi-007',
        variantId: 'var-007-1',
        variantSku: 'JJ-OASYS-BC85-DIA143',
        productName: 'Acuvue Oasys with HydraLuxe Daily (30pk)',
        orderedQuantity: 40,
        previouslyReceived: 0,
        receivedNow: 25,
        damagedOrMissing: 0,
        unitCost: 1450,
      }
    ]
  }
];
