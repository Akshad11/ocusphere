import * as request from 'supertest';
import { TestAppContext } from './setup/test-app';

describe('Purchase Orders API (e2e)', () => {
  let ctx: TestAppContext;
  let server: any;
  let testSupplier: any;
  let testVariant: any;
  let createdPoId: string;

  beforeAll(async () => {
    ctx = await TestAppContext.create();
    server = ctx.app.getHttpServer();

    testSupplier = await ctx.prisma.supplier.findFirst();
    testVariant = await ctx.prisma.productVariant.findFirst();
  });

  afterAll(async () => {
    await ctx.close();
  });

  describe('GET /api/v1/purchase-orders', () => {
    it('should deny unauthenticated requests with 401', async () => {
      await request(server).get('/api/v1/purchase-orders').expect(401);
    });

    it('should deny staff without manage_purchase_orders permission with 403', async () => {
      await request(server)
        .get('/api/v1/purchase-orders')
        .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
        .expect(403);
    });

    it('should list purchase orders for Manager', async () => {
      const res = await request(server)
        .get('/api/v1/purchase-orders')
        .set('Authorization', `Bearer ${ctx.tokens.managerToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /api/v1/purchase-orders', () => {
    it('should reject purchase order with empty items with 400', async () => {
      const res = await request(server)
        .post('/api/v1/purchase-orders')
        .set('Authorization', `Bearer ${ctx.tokens.managerToken}`)
        .send({
          supplierId: testSupplier.id,
          expectedDeliveryDate: '2026-11-20',
          items: [],
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should create a valid purchase order in Draft status', async () => {
      const res = await request(server)
        .post('/api/v1/purchase-orders')
        .set('Authorization', `Bearer ${ctx.tokens.managerToken}`)
        .send({
          supplierId: testSupplier.id,
          expectedDeliveryDate: '2026-11-20',
          notes: 'Test PO order',
          items: [
            {
              variantId: testVariant.id,
              orderedQuantity: 10,
              unitCost: 1500,
            },
          ],
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.orderNumber).toMatch(/^PO-\d{4}-\d+/);
      expect(res.body.data.status).toBe('Draft');
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.totalCost).toBeGreaterThan(0);

      createdPoId = res.body.data.id;
    });
  });

  describe('GET /api/v1/purchase-orders/:id', () => {
    it('should retrieve single purchase order with items', async () => {
      const res = await request(server)
        .get(`/api/v1/purchase-orders/${createdPoId}`)
        .set('Authorization', `Bearer ${ctx.tokens.managerToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdPoId);
      expect(res.body.data.items.length).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent PO ID', async () => {
      await request(server)
        .get('/api/v1/purchase-orders/non-existent-po-id')
        .set('Authorization', `Bearer ${ctx.tokens.managerToken}`)
        .expect(404);
    });
  });

  describe('POST /api/v1/purchase-orders/:id/submit', () => {
    it('should advance purchase order status from Draft to Submitted', async () => {
      const res = await request(server)
        .post(`/api/v1/purchase-orders/${createdPoId}/submit`)
        .set('Authorization', `Bearer ${ctx.tokens.managerToken}`)
        .expect((res) => expect([200, 201]).toContain(res.status));

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Sent');
    });

    it('should reject submitting an already submitted PO with 400', async () => {
      const res = await request(server)
        .post(`/api/v1/purchase-orders/${createdPoId}/submit`)
        .set('Authorization', `Bearer ${ctx.tokens.managerToken}`)
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });
});
