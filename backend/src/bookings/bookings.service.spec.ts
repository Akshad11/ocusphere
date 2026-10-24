import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../database/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BookingStatus, BookingType } from '@prisma/client';

describe('BookingsService', () => {
  let service: BookingsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      booking: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      customer: {
        findUnique: jest.fn(),
      },
      productVariant: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      stockMovement: {
        create: jest.fn(),
      },
      notificationLog: {
        create: jest.fn(),
      },
      $transaction: jest.fn((cb) => cb(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
  });

  describe('createReservation', () => {
    it('should hold stock atomically when available inventory is sufficient', async () => {
      prisma.productVariant.findUnique.mockResolvedValue({
        id: 'var-1',
        variantSku: 'SKU-01',
        stockOnHand: 5,
        reservedQuantity: 1, // Available = 4
        sellingPrice: '4999',
        images: [],
        product: { name: 'Titanium Frame', featuredImage: 'img.jpg' },
      });

      prisma.booking.create.mockImplementation((args: any) => ({
        id: 'book-1',
        ...args.data,
      }));

      const booking = await service.createReservation({
        customerName: 'Pooja Sharma',
        customerPhone: '9819876543',
        productId: 'prod-1',
        variantId: 'var-1',
        quantity: 2,
        pickupDate: '2026-11-10',
        pickupSlot: 'Morning',
      });

      // Reserved quantity incremented by 2
      expect(prisma.productVariant.update).toHaveBeenCalledWith({
        where: { id: 'var-1' },
        data: { reservedQuantity: { increment: 2 } },
      });

      expect(prisma.stockMovement.create).toHaveBeenCalled();
      expect(booking.referenceNumber).toContain('RES-');
    });

    it('should reject reservation if requested quantity exceeds available stock', async () => {
      prisma.productVariant.findUnique.mockResolvedValue({
        id: 'var-1',
        stockOnHand: 3,
        reservedQuantity: 2, // Available = 1
        product: { name: 'Titanium Frame' },
      });

      await expect(
        service.createReservation({
          customerName: 'Pooja Sharma',
          customerPhone: '9819876543',
          productId: 'prod-1',
          variantId: 'var-1',
          quantity: 2, // Requesting 2 > 1
          pickupDate: '2026-11-10',
          pickupSlot: 'Morning',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancelReservation', () => {
    it('should release reserved stock when reservation is cancelled', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        id: 'res-1',
        referenceNumber: 'RES-2026-1010',
        bookingType: BookingType.reservation,
        status: BookingStatus.Confirmed,
        reservedItems: [{ variantId: 'var-1', variantSku: 'SKU-01', quantity: 2 }],
        timeline: [],
      });

      prisma.booking.update.mockResolvedValue({
        id: 'res-1',
        status: BookingStatus.Cancelled,
      });

      await service.cancelReservation('res-1', 'Customer cancelled');

      expect(prisma.productVariant.update).toHaveBeenCalledWith({
        where: { id: 'var-1' },
        data: { reservedQuantity: { decrement: 2 } },
      });
      expect(prisma.stockMovement.create).toHaveBeenCalled();
    });
  });
});
