import { Test, TestingModule } from '@nestjs/testing';
import { PurchasingService } from './purchasing.service';
import { PrismaService } from '../database/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { PurchaseOrderStatus } from '@prisma/client';

describe('PurchasingService', () => {
  let service: PurchasingService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      purchaseOrder: {
        count: jest.fn().mockResolvedValue(0),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      purchaseOrderItem: {
        findMany: jest.fn(),
        update: jest.fn(),
      },
      goodsReceipt: {
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      productVariant: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      stockMovement: {
        create: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
      $transaction: jest.fn((cb) => cb(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchasingService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PurchasingService>(PurchasingService);
  });

  describe('createGoodsReceipt', () => {
    it('should increment stockOnHand and update PO status when shipment is received', async () => {
      prisma.purchaseOrder.findUnique.mockResolvedValue({
        id: 'po-1',
        orderNumber: 'PO-2026-0001',
        status: PurchaseOrderStatus.Sent,
        supplierName: 'Luxottica',
        items: [
          {
            id: 'poi-1',
            variantId: 'v1',
            productName: 'Aviator',
            variantSku: 'RB-3025',
            orderedQuantity: 10,
            receivedQuantity: 0,
            unitCost: '4800',
          },
        ],
      });

      prisma.productVariant.findUnique.mockResolvedValue({
        id: 'v1',
        stockOnHand: 5,
        variantSku: 'RB-3025',
      });

      prisma.purchaseOrderItem.findMany.mockResolvedValue([
        {
          id: 'poi-1',
          orderedQuantity: 10,
          receivedQuantity: 10, // Fully received now
        },
      ]);

      prisma.goodsReceipt.create.mockResolvedValue({
        id: 'grn-1',
        receiptNumber: 'GRN-2026-0001',
      });

      await service.createGoodsReceipt(
        {
          purchaseOrderId: 'po-1',
          items: [{ purchaseOrderItemId: 'poi-1', receivedNow: 10 }],
        },
        'Inventory Staff',
      );

      // Stock should increase from 5 to 15
      expect(prisma.productVariant.update).toHaveBeenCalledWith({
        where: { id: 'v1' },
        data: { stockOnHand: 15 },
      });

      // PO status should be marked Received
      expect(prisma.purchaseOrder.update).toHaveBeenCalledWith({
        where: { id: 'po-1' },
        data: { status: PurchaseOrderStatus.Received },
      });

      expect(prisma.stockMovement.create).toHaveBeenCalled();
    });

    it('should prevent receiving quantity greater than ordered quantity', async () => {
      prisma.purchaseOrder.findUnique.mockResolvedValue({
        id: 'po-1',
        orderNumber: 'PO-2026-0001',
        status: PurchaseOrderStatus.Sent,
        items: [
          {
            id: 'poi-1',
            variantId: 'v1',
            orderedQuantity: 10,
            receivedQuantity: 8, // Only 2 remaining!
          },
        ],
      });

      await expect(
        service.createGoodsReceipt(
          {
            purchaseOrderId: 'po-1',
            items: [{ purchaseOrderItemId: 'poi-1', receivedNow: 5 }], // 5 > 2
          },
          'Inventory Staff',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
