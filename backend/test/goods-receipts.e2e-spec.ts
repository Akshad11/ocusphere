import * as request from 'supertest';
import { TestAppContext } from './setup/test-app';

describe('Goods Receipts & Inward Inventory API (e2e)', () => {
  let ctx: TestAppContext;
  let server: any;
  let testSupplier: any;
  let testVariant: any;
  let activePo: any;
  let poItem: any;
  let createdGrnId: string;

  beforeAll(async () => {
    ctx = await TestAppContext.create();
    server = ctx.app.getHttpServer();

    testSupplier = await ctx.prisma.supplier.findFirst();
    testVariant = await ctx.prisma.productVariant.findFirst();

    // Create and submit a dedicated Purchase Order
    const poRes = await request(server)
      .post('/api/v1/purchase-orders')
      .set('Authorization', `Bearer ${ctx.tokens.managerToken}`)
      .send({
        supplierId: testSupplier.id,
        expectedDeliveryDate: '2026-11-25',
        notes: 'Goods Receipt Test PO',
        items: [
          {
            variantId: testVariant.id,
            orderedQuantity: 5,
            unitCost: 1200,
          },
        ],
      });

    activePo = poRes.body.data;
    poItem = activePo.items[0];

    // Submit PO so it is in Submitted state
    await request(server)
      .post(`/api/v1/purchase-orders/${activePo.id}/submit`)
      .set('Authorization', `Bearer ${ctx.tokens.managerToken}`);
  });

  afterAll(async () => {
    await ctx.close();
  });

  describe('GET /api/v1/goods-receipts', () => {
    it('should deny unauthenticated requests with 401', async () => {
      await request(server).get('/api/v1/goods-receipts').expect(401);
    });

    it('should deny staff without manage_purchase_orders permission with 403', async () => {
      await request(server)
        .get('/api/v1/goods-receipts')
        .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
        .expect(403);
    });

    it('should list all goods receipts for Inventory Staff / Manager', async () => {
      const res = await request(server)
        .get('/api/v1/goods-receipts')
        .set('Authorization', `Bearer ${ctx.tokens.managerToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /api/v1/goods-receipts', () => {
    it('should reject goods receipt with empty items with 400', async () => {
      const res = await request(server)
        .post('/api/v1/goods-receipts')
        .set('Authorization', `Bearer ${ctx.tokens.managerToken}`)
        .send({
          purchaseOrderId: activePo.id,
          items: [],
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should reject receipt quantity exceeding remaining ordered quantity with 400', async () => {
      const res = await request(server)
        .post('/api/v1/goods-receipts')
        .set('Authorization', `Bearer ${ctx.tokens.managerToken}`)
        .send({
          purchaseOrderId: activePo.id,
          items: [
            {
              purchaseOrderItemId: poItem.id,
              receivedNow: 99,
            },
          ],
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error?.message || res.body.message).toMatch(/exceeds remaining pending quantity/i);
    });

    it('should process partial goods receipt, increase inventory stock, and log stock movement', async () => {
      const stockBefore = (await ctx.prisma.productVariant.findUnique({
        where: { id: testVariant.id },
      }))!.stockOnHand;

      const res = await request(server)
        .post('/api/v1/goods-receipts')
        .set('Authorization', `Bearer ${ctx.tokens.managerToken}`)
        .send({
          purchaseOrderId: activePo.id,
          deliveryNoteNumber: 'DN-TEST-001',
          items: [
            {
              purchaseOrderItemId: poItem.id,
              receivedNow: 2,
              damagedOrMissing: 0,
            },
          ],
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.receiptNumber).toMatch(/^GRN-\d{4}-\d+/);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].receivedNow).toBe(2);

      createdGrnId = res.body.data.id;

      // Verify stock was incremented by 2
      const stockAfter = (await ctx.prisma.productVariant.findUnique({
        where: { id: testVariant.id },
      }))!.stockOnHand;
      expect(stockAfter).toBe(stockBefore + 2);

      // Verify stock movement was recorded
      const movement = await ctx.prisma.stockMovement.findFirst({
        where: {
          variantId: testVariant.id,
          referenceId: res.body.data.receiptNumber,
        },
      });
      expect(movement).toBeDefined();
      expect(movement!.quantityDelta).toBe(2);
      expect(movement!.movementType).toBe('purchase_receipt');

      // Verify PO status updated to Partially_Received
      const updatedPo = await ctx.prisma.purchaseOrder.findUnique({
        where: { id: activePo.id },
      });
      expect(updatedPo!.status).toBe('Partially_Received');
    });

    it('should receive remaining items and advance PO status to Received', async () => {
      const res = await request(server)
        .post('/api/v1/goods-receipts')
        .set('Authorization', `Bearer ${ctx.tokens.managerToken}`)
        .send({
          purchaseOrderId: activePo.id,
          deliveryNoteNumber: 'DN-TEST-002',
          items: [
            {
              purchaseOrderItemId: poItem.id,
              receivedNow: 3,
            },
          ],
        })
        .expect(201);

      expect(res.body.success).toBe(true);

      // Verify PO is now fully Received
      const updatedPo = await ctx.prisma.purchaseOrder.findUnique({
        where: { id: activePo.id },
      });
      expect(updatedPo!.status).toBe('Received');
    });

    it('should reject further receipts against a fully received PO with 400', async () => {
      const res = await request(server)
        .post('/api/v1/goods-receipts')
        .set('Authorization', `Bearer ${ctx.tokens.managerToken}`)
        .send({
          purchaseOrderId: activePo.id,
          items: [
            {
              purchaseOrderItemId: poItem.id,
              receivedNow: 1,
            },
          ],
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/goods-receipts/:id', () => {
    it('should retrieve single goods receipt details by ID', async () => {
      const res = await request(server)
        .get(`/api/v1/goods-receipts/${createdGrnId}`)
        .set('Authorization', `Bearer ${ctx.tokens.managerToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdGrnId);
      expect(res.body.data.items.length).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent goods receipt ID', async () => {
      await request(server)
        .get('/api/v1/goods-receipts/non-existent-grn-id')
        .set('Authorization', `Bearer ${ctx.tokens.managerToken}`)
        .expect(404);
    });
  });
});
