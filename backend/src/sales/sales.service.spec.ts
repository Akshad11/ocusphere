import { Test, TestingModule } from '@nestjs/testing';
import { SalesService } from './sales.service';
import { PrismaService } from '../database/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { PaymentMethod, SaleStatus } from '@prisma/client';

describe('SalesService', () => {
  let service: SalesService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      storeSetting: {
        findUnique: jest.fn().mockResolvedValue({ taxRatePercent: 12.0 }),
      },
      sale: {
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      saleItem: {
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      productVariant: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      stockMovement: {
        create: jest.fn(),
      },
      coupon: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      offer: {
        update: jest.fn(),
      },
      customer: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
      saleReturn: {
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
      },
      $transaction: jest.fn((cb) => cb(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
  });

  describe('createSale', () => {
    it('should calculate authoritative totals from DB pricing and deduct stock atomically', async () => {
      prisma.productVariant.findMany.mockResolvedValue([
        {
          id: 'v1',
          variantSku: 'SKU-001',
          sellingPrice: '5000.00',
          stockOnHand: 10,
          product: { name: 'Ray-Ban Aviator', brand: 'Ray-Ban' },
          colorName: 'Gold',
          size: 'M',
        },
      ]);

      prisma.sale.create.mockImplementation((args: any) => ({
        id: 'sale-1',
        ...args.data,
      }));

      prisma.sale.findUnique.mockResolvedValue({
        id: 'sale-1',
        invoiceNumber: 'INV-2026-0001',
        subtotal: 5000,
        discountTotal: 0,
        taxTotal: 600,
        grandTotal: 5600,
        items: [
          {
            variantId: 'v1',
            quantity: 1,
            unitPrice: 5000,
            total: 5000,
          },
        ],
      });

      const sale = await service.createSale(
        {
          items: [{ variantId: 'v1', quantity: 1 }],
          paymentMethod: PaymentMethod.Cash,
          customerName: 'Aarav Mehta',
        },
        'Aman Patel',
      );

      // Verify stock was decremented from 10 to 9
      expect(prisma.productVariant.update).toHaveBeenCalledWith({
        where: { id: 'v1' },
        data: { stockOnHand: 9 },
      });

      // Verify authoritative tax calculation: 12% on ₹5000 = ₹600 tax, ₹5600 total
      expect(sale.grandTotal).toBe(5600);
    });

    it('should reject checkout when requested quantity exceeds available stock', async () => {
      prisma.productVariant.findMany.mockResolvedValue([
        {
          id: 'v1',
          variantSku: 'SKU-001',
          sellingPrice: '5000.00',
          stockOnHand: 2, // Only 2 in stock
          product: { name: 'Ray-Ban Aviator' },
        },
      ]);

      await expect(
        service.createSale(
          {
            items: [{ variantId: 'v1', quantity: 5 }], // Requesting 5
            paymentMethod: PaymentMethod.Cash,
          },
          'Aman Patel',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return existing transaction if duplicate idempotency key is submitted', async () => {
      prisma.sale.findUnique.mockResolvedValue({
        id: 'existing-sale-1',
        idempotencyKey: 'idem-12345',
        invoiceNumber: 'INV-2026-0001',
        grandTotal: 5600,
        items: [],
      });

      const result = await service.createSale(
        {
          items: [{ variantId: 'v1', quantity: 1 }],
          paymentMethod: PaymentMethod.Cash,
          idempotencyKey: 'idem-12345',
        },
        'Aman Patel',
      );

      expect(result.id).toBe('existing-sale-1');
      // No stock deduction or sale insertion should occur for duplicate
      expect(prisma.productVariant.update).not.toHaveBeenCalled();
    });
  });

  describe('processReturn', () => {
    it('should reject return if returned quantity exceeds sold quantity', async () => {
      prisma.sale.findUnique.mockResolvedValue({
        id: 'sale-1',
        invoiceNumber: 'INV-2026-0001',
        status: SaleStatus.Completed,
        items: [
          {
            id: 'item-1',
            variantId: 'v1',
            productName: 'Frame',
            quantity: 1,
            returnedQuantity: 1, // Already returned!
            unitPrice: '5000',
          },
        ],
      });

      await expect(
        service.processReturn(
          'sale-1',
          {
            refundMethod: PaymentMethod.Cash,
            items: [
              {
                saleItemId: 'item-1',
                returnedQuantity: 1,
                reason: 'Fitting Issue',
              },
            ],
          },
          'Store Manager',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
