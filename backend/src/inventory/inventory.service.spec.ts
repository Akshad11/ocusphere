import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { PrismaService } from '../database/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { AdjustmentType, AdjustmentReason } from './dto/stock-adjustment.dto';

describe('InventoryService', () => {
  let service: InventoryService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      productVariant: {
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      stockMovement: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      stockAdjustment: {
        create: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
      $transaction: jest.fn((cb) => cb(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  describe('adjustStock', () => {
    it('should correctly increment stock and create StockMovement', async () => {
      prisma.productVariant.findUnique.mockResolvedValue({
        id: 'var-1',
        variantSku: 'OC-101-BLK',
        stockOnHand: 10,
        product: { name: 'Titanium Frame' },
      });

      prisma.productVariant.update.mockResolvedValue({
        id: 'var-1',
        stockOnHand: 15,
      });

      prisma.stockMovement.create.mockResolvedValue({
        id: 'mov-1',
        quantityDelta: 5,
        newStock: 15,
      });

      const result = await service.adjustStock(
        {
          variantId: 'var-1',
          adjustmentType: AdjustmentType.ADD,
          quantity: 5,
          reason: AdjustmentReason.CYCLE_COUNT,
          notes: 'Found extra boxed piece',
        },
        'Aman Patel',
      );

      expect(prisma.productVariant.update).toHaveBeenCalledWith({
        where: { id: 'var-1' },
        data: { stockOnHand: 15 },
      });
      expect(prisma.stockMovement.create).toHaveBeenCalled();
      expect(result.variant.stockOnHand).toBe(15);
    });

    it('should reject subtraction that would cause negative inventory', async () => {
      prisma.productVariant.findUnique.mockResolvedValue({
        id: 'var-1',
        variantSku: 'OC-101-BLK',
        stockOnHand: 2,
        product: { name: 'Titanium Frame' },
      });

      await expect(
        service.adjustStock(
          {
            variantId: 'var-1',
            adjustmentType: AdjustmentType.SUBTRACT,
            quantity: 5, // 2 - 5 = -3 (Invalid)
            reason: AdjustmentReason.DAMAGED,
          },
          'Aman Patel',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
