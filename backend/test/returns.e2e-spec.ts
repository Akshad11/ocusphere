import * as request from 'supertest';
import { TestAppContext } from './setup/test-app';
import { PaymentMethod } from '@prisma/client';

describe('Sales Returns & Refunds API (e2e)', () => {
  let ctx: TestAppContext;
  let server: any;
  let testVariant: any;
  let activeSale: any;
  let saleItemToReturn: any;

  beforeAll(async () => {
    ctx = await TestAppContext.create();
    server = ctx.app.getHttpServer();

    // Find or create a test variant with stock
    testVariant = await ctx.prisma.productVariant.findFirst({
      where: { stockOnHand: { gte: 10 } },
      include: { product: true },
    });

    // Create a fresh sale specifically for return testing
    const saleRes = await request(server)
      .post('/api/v1/sales')
      .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
      .send({
        paymentMethod: PaymentMethod.Cash,
        amountReceived: 10000,
        items: [
          {
            variantId: testVariant.id,
            quantity: 3,
            itemDiscount: 0,
          },
        ],
        customerName: 'Return Tester',
        customerPhone: '9811223344',
      });

    activeSale = saleRes.body.data;
    saleItemToReturn = activeSale.items[0];
  });

  afterAll(async () => {
    await ctx.close();
  });

  describe('GET /api/v1/sales/returns', () => {
    it('should deny unauthenticated requests with 401', async () => {
      await request(server).get('/api/v1/sales/returns').expect(401);
    });

    it('should list returns for authorized staff', async () => {
      const res = await request(server)
        .get('/api/v1/sales/returns')
        .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /api/v1/sales/:id/returns', () => {
    it('should deny unauthenticated requests with 401', async () => {
      await request(server)
        .post(`/api/v1/sales/${activeSale.id}/returns`)
        .send({
          refundMethod: PaymentMethod.Cash,
          items: [
            {
              saleItemId: saleItemToReturn.id,
              returnedQuantity: 1,
              reason: 'Fit test',
            },
          ],
        })
        .expect(401);
    });

    it('should deny staff without pos_access with 403', async () => {
      await request(server)
        .post(`/api/v1/sales/${activeSale.id}/returns`)
        .set('Authorization', `Bearer ${ctx.tokens.inventoryStaffToken}`)
        .send({
          refundMethod: PaymentMethod.Cash,
          items: [
            {
              saleItemId: saleItemToReturn.id,
              returnedQuantity: 1,
              reason: 'Fit test',
            },
          ],
        })
        .expect(403);
    });

    it('should reject return with empty items array with 400', async () => {
      const res = await request(server)
        .post(`/api/v1/sales/${activeSale.id}/returns`)
        .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
        .send({
          refundMethod: PaymentMethod.Cash,
          items: [],
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should reject return quantity exceeding purchased quantity with 400', async () => {
      const res = await request(server)
        .post(`/api/v1/sales/${activeSale.id}/returns`)
        .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
        .send({
          refundMethod: PaymentMethod.Cash,
          items: [
            {
              saleItemId: saleItemToReturn.id,
              returnedQuantity: 99,
              reason: 'Impossible return qty',
            },
          ],
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error?.message || res.body.message).toMatch(/Maximum returnable/i);
    });

    it('should process valid partial return, restock inventory, and update saleItem', async () => {
      const stockBefore = (await ctx.prisma.productVariant.findUnique({
        where: { id: testVariant.id },
      }))!.stockOnHand;

      const res = await request(server)
        .post(`/api/v1/sales/${activeSale.id}/returns`)
        .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
        .send({
          refundMethod: PaymentMethod.Cash,
          items: [
            {
              saleItemId: saleItemToReturn.id,
              returnedQuantity: 1,
              restockStock: true,
              reason: 'Loose nose pads',
            },
          ],
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.returnNumber).toMatch(/^RET-\d{4}-\d+/);
      expect(Number(res.body.data.totalRefund)).toBeGreaterThan(0);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].returnedQuantity).toBe(1);

      // Verify variant stock incremented by 1
      const stockAfter = (await ctx.prisma.productVariant.findUnique({
        where: { id: testVariant.id },
      }))!.stockOnHand;
      expect(stockAfter).toBe(stockBefore + 1);

      // Verify stock movement of type 'return' was recorded
      const movement = await ctx.prisma.stockMovement.findFirst({
        where: {
          variantId: testVariant.id,
          referenceId: res.body.data.returnNumber,
        },
      });
      expect(movement).toBeDefined();
      expect(movement!.quantityDelta).toBe(1);
      expect(movement!.movementType).toBe('return');
    });
  });
});
