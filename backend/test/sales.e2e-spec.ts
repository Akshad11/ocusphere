import * as request from 'supertest';
import { TestAppContext } from './setup/test-app';
import { PaymentMethod } from '@prisma/client';

describe('Sales & POS Billing Checkout API (e2e)', () => {
  let ctx: TestAppContext;
  let server: any;
  let testVariant: any;
  let createdSaleId: string;
  let testInvoiceNumber: string;

  beforeAll(async () => {
    ctx = await TestAppContext.create();
    server = ctx.app.getHttpServer();

    // Find an active product variant with ample stock
    testVariant = await ctx.prisma.productVariant.findFirst({
      where: {
        stockOnHand: { gte: 10 },
      },
      include: { product: true },
    });

    if (!testVariant) {
      throw new Error('No product variant with >= 10 stock available in test database.');
    }
  });

  afterAll(async () => {
    await ctx.close();
  });

  describe('POST /api/v1/sales', () => {
    it('should deny unauthenticated requests with 401 Unauthorized', async () => {
      await request(server)
        .post('/api/v1/sales')
        .send({
          paymentMethod: PaymentMethod.Cash,
          items: [{ variantId: testVariant.id, quantity: 1 }],
        })
        .expect(401);
    });

    it('should deny staff without pos_access with 403 Forbidden', async () => {
      await request(server)
        .post('/api/v1/sales')
        .set('Authorization', `Bearer ${ctx.tokens.inventoryStaffToken}`)
        .send({
          paymentMethod: PaymentMethod.Cash,
          items: [{ variantId: testVariant.id, quantity: 1 }],
        })
        .expect(403);
    });

    it('should reject sale with empty items list with 400 Bad Request', async () => {
      const res = await request(server)
        .post('/api/v1/sales')
        .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
        .send({
          paymentMethod: PaymentMethod.Cash,
          items: [],
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should reject sale for non-existent variant with 404 Not Found', async () => {
      const res = await request(server)
        .post('/api/v1/sales')
        .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
        .send({
          paymentMethod: PaymentMethod.Cash,
          items: [{ variantId: 'non-existent-var-id', quantity: 1 }],
        })
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    it('should reject sale when requested quantity exceeds stockOnHand with 400 Bad Request', async () => {
      const res = await request(server)
        .post('/api/v1/sales')
        .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
        .send({
          paymentMethod: PaymentMethod.Cash,
          items: [{ variantId: testVariant.id, quantity: 999999 }],
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error?.message || res.body.message).toMatch(/Insufficient stock/i);
    });

    it('should process a valid POS checkout sale, calculate tax correctly, and deduct stock', async () => {
      const stockBefore = (await ctx.prisma.productVariant.findUnique({
        where: { id: testVariant.id },
      }))!.stockOnHand;

      const idempotencyKey = `idem-test-sale-${Date.now()}`;

      const res = await request(server)
        .post('/api/v1/sales')
        .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
        .send({
          paymentMethod: PaymentMethod.Cash,
          amountReceived: 20000,
          idempotencyKey,
          items: [
            {
              variantId: testVariant.id,
              quantity: 2,
              itemDiscount: 100,
            },
          ],
          customerName: 'Rohit Sharma',
          customerPhone: '9876543210',
          customerEmail: 'rohit.test@gmail.com',
          notes: 'Standard optical sale test',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.invoiceNumber).toMatch(/^INV-\d{4}-\d+/);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].quantity).toBe(2);
      expect(res.body.data.taxTotal).toBeGreaterThan(0);
      expect(res.body.data.grandTotal).toBeGreaterThan(0);

      createdSaleId = res.body.data.id;
      testInvoiceNumber = res.body.data.invoiceNumber;

      // Verify stock was deducted by exactly 2
      const stockAfter = (await ctx.prisma.productVariant.findUnique({
        where: { id: testVariant.id },
      }))!.stockOnHand;
      expect(stockAfter).toBe(stockBefore - 2);

      // Verify stock movement was recorded
      const movement = await ctx.prisma.stockMovement.findFirst({
        where: {
          variantId: testVariant.id,
          referenceId: testInvoiceNumber,
        },
      });
      expect(movement).toBeDefined();
      expect(movement!.quantityDelta).toBe(-2);
      expect(movement!.movementType).toBe('sale');
    });

    it('should handle idempotency key and return existing sale without duplicate deduction', async () => {
      const stockBefore = (await ctx.prisma.productVariant.findUnique({
        where: { id: testVariant.id },
      }))!.stockOnHand;

      const idempotencyKey = `idem-repeat-${Date.now()}`;

      // First call
      const firstRes = await request(server)
        .post('/api/v1/sales')
        .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
        .send({
          paymentMethod: PaymentMethod.UPI,
          idempotencyKey,
          items: [{ variantId: testVariant.id, quantity: 1 }],
        })
        .expect(201);

      const firstSaleId = firstRes.body.data.id;

      // Second call with identical idempotencyKey
      const secondRes = await request(server)
        .post('/api/v1/sales')
        .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
        .send({
          paymentMethod: PaymentMethod.UPI,
          idempotencyKey,
          items: [{ variantId: testVariant.id, quantity: 1 }],
        })
        .expect(201);

      expect(secondRes.body.data.id).toBe(firstSaleId);

      // Stock should only have been deducted once (1 item)
      const stockAfter = (await ctx.prisma.productVariant.findUnique({
        where: { id: testVariant.id },
      }))!.stockOnHand;
      expect(stockAfter).toBe(stockBefore - 1);
    });
  });

  describe('GET /api/v1/sales', () => {
    it('should list sales with pagination and filters', async () => {
      const res = await request(server)
        .get('/api/v1/sales')
        .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should filter sales by status', async () => {
      const res = await request(server)
        .get('/api/v1/sales?status=Completed')
        .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.every((s: any) => s.status === 'Completed')).toBe(true);
    });
  });

  describe('GET /api/v1/sales/:id', () => {
    it('should retrieve single sale details by ID', async () => {
      const res = await request(server)
        .get(`/api/v1/sales/${createdSaleId}`)
        .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdSaleId);
      expect(res.body.data.items.length).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent sale ID', async () => {
      await request(server)
        .get('/api/v1/sales/non-existent-sale-id')
        .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
        .expect(404);
    });
  });

  describe('GET /api/v1/sales/:id/receipt', () => {
    it('should return printable tax invoice receipt payload', async () => {
      const res = await request(server)
        .get(`/api/v1/sales/${createdSaleId}/receipt`)
        .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.storeName).toBeDefined();
      expect(res.body.data.invoiceNumber).toBe(testInvoiceNumber);
      expect(res.body.data.items).toBeDefined();
      expect(res.body.data.financials.grandTotal).toBeDefined();
    });
  });
});
