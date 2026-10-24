import { Test, TestingModule } from '@nestjs/testing';
import { OffersService } from './offers.service';
import { PrismaService } from '../database/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('OffersService', () => {
  let service: OffersService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      offer: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      coupon: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      couponRedemption: {
        count: jest.fn(),
        create: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
      $transaction: jest.fn((cb) => cb(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OffersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<OffersService>(OffersService);
  });

  describe('validateCoupon', () => {
    it('should calculate 15% discount correctly with minimum purchase satisfied', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      prisma.coupon.findUnique.mockResolvedValue({
        id: 'c1',
        code: 'FESTIVE15',
        isActive: true,
        usedCount: 5,
        usageLimit: 100,
        perCustomerLimit: 2,
        expiryDate: futureDate,
        offer: {
          name: 'Festive Offer',
          isActive: true,
          endDate: futureDate,
          discountType: 'Percentage',
          discountValue: '15',
          minimumPurchase: '3000',
          maximumDiscount: '1000',
        },
      });

      const result = await service.validateCoupon({
        code: 'FESTIVE15',
        subtotal: 5000,
      });

      expect(result.isValid).toBe(true);
      // 15% of 5000 is 750, which is below max discount 1000
      expect(result.discountAmount).toBe(750);
      expect(result.newSubtotal).toBe(4250);
    });

    it('should reject coupon if subtotal is below minimum purchase', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      prisma.coupon.findUnique.mockResolvedValue({
        id: 'c1',
        code: 'FESTIVE15',
        isActive: true,
        usedCount: 5,
        usageLimit: 100,
        expiryDate: futureDate,
        offer: {
          isActive: true,
          endDate: futureDate,
          minimumPurchase: '3000',
        },
      });

      await expect(
        service.validateCoupon({
          code: 'FESTIVE15',
          subtotal: 2000, // Below 3000
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
