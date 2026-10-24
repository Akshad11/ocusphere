import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../database/prisma.service';
import { ConflictException } from '@nestjs/common';
import { ProductType, PublicationStatus, StaffRole } from '@prisma/client';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      product: {
        count: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      productVariant: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
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
        ProductsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  describe('list & costPrice security', () => {
    it('should mask costPrice from public storefront requests', async () => {
      prisma.product.count.mockResolvedValue(1);
      prisma.product.findMany.mockResolvedValue([
        {
          id: 'p1',
          name: 'Titanium Round',
          basePrice: '4999',
          variants: [
            {
              id: 'v1',
              variantSku: 'OC-101-BLK',
              sellingPrice: '4999',
              costPrice: '1950', // Internal wholesale cost
              stockOnHand: 10,
            },
          ],
        },
      ]);

      // Public call (no authenticated user)
      const result = await service.list({});
      expect(result.items[0].variants[0].costPrice).toBeUndefined();
      expect(result.items[0].variants[0].sellingPrice).toBe(4999);
    });

    it('should expose costPrice when user has view_cost_price permission', async () => {
      prisma.product.count.mockResolvedValue(1);
      prisma.product.findMany.mockResolvedValue([
        {
          id: 'p1',
          name: 'Titanium Round',
          basePrice: '4999',
          variants: [
            {
              id: 'v1',
              variantSku: 'OC-101-BLK',
              sellingPrice: '4999',
              costPrice: '1950',
              stockOnHand: 10,
            },
          ],
        },
      ]);

      const managerUser = {
        role: StaffRole.STORE_MANAGER,
        customPermissions: ['view_cost_price'],
      };

      const result = await service.list({}, managerUser);
      expect(result.items[0].variants[0].costPrice).toBe(1950);
    });
  });

  describe('create', () => {
    it('should reject creation if duplicate SKU exists', async () => {
      prisma.product.findUnique.mockResolvedValue(null);
      prisma.productVariant.findMany.mockResolvedValue([{ variantSku: 'DUPLICATE-SKU' }]);

      await expect(
        service.create({
          name: 'New Frame',
          brand: 'Ray-Ban',
          category: 'Unisex',
          productType: ProductType.Eyeglasses,
          description: 'Desc',
          modelCode: 'RB-01',
          basePrice: 5000,
          variants: [
            {
              variantSku: 'DUPLICATE-SKU',
              barcode: '890111',
              colorName: 'Black',
              colorHex: '#000',
              size: 'M',
              material: 'Acetate',
              sellingPrice: 5000,
              costPrice: 2000,
            },
          ],
        }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
