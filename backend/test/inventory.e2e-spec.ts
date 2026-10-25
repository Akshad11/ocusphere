import * as request from 'supertest';
import { TestAppContext } from './setup/test-app';

describe('Inventory Management API (e2e)', () => {
  let ctx: TestAppContext;
  let server: any;
  let testVariantId: string;
  let createdRequestId: string;
  let createdStocktakeId: string;

  beforeAll(async () => {
    ctx = await TestAppContext.create();
    server = ctx.app.getHttpServer();

    // Fetch an existing variant from test database
    const variant = await ctx.prisma.productVariant.findFirst();
    if (!variant) throw new Error('No product variant available for testing inventory');
    testVariantId = variant.id;
  });

  afterAll(async () => {
    await ctx.close();
  });

  describe('GET /api/v1/inventory', () => {
    it('should return stock balances for authorized inventory staff', async () => {
      const res = await request(server)
        .get('/api/v1/inventory')
        .set('Authorization', `Bearer ${ctx.tokens.inventoryStaffToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should filter low-stock items when lowStockOnly is true', async () => {
      const res = await request(server)
        .get('/api/v1/inventory')
        .query({ lowStockOnly: true })
        .set('Authorization', `Bearer ${ctx.tokens.managerToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should deny Cashier without adjust_inventory with 403 Forbidden', async () => {
      await request(server)
        .get('/api/v1/inventory')
        .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
        .expect(403);
    });
  });

  describe('GET /api/v1/inventory/:productVariantId', () => {
    it('should return variant stock balance details', async () => {
      const res = await request(server)
        .get(`/api/v1/inventory/${testVariantId}`)
        .set('Authorization', `Bearer ${ctx.tokens.inventoryStaffToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(testVariantId);
      expect(res.body.data.stockOnHand).toBeDefined();
    });

    it('should return 404 for non-existent variant ID', async () => {
      await request(server)
        .get('/api/v1/inventory/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${ctx.tokens.inventoryStaffToken}`)
        .expect(404);
    });
  });

  describe('POST /api/v1/inventory/adjustments', () => {
    it('should successfully increase stock on add adjustment', async () => {
      const res = await request(server)
        .post('/api/v1/inventory/adjustments')
        .set('Authorization', `Bearer ${ctx.tokens.inventoryStaffToken}`)
        .send({
          variantId: testVariantId,
          adjustmentType: 'add',
          quantity: 5,
          reason: 'Cycle Count Discrepancy',
          notes: 'Audit recount addition',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.movement).toBeDefined();
      expect(res.body.data.movement.quantityDelta).toBe(5);
    });

    it('should reject invalid adjustment type with 400 Bad Request', async () => {
      await request(server)
        .post('/api/v1/inventory/adjustments')
        .set('Authorization', `Bearer ${ctx.tokens.inventoryStaffToken}`)
        .send({
          variantId: testVariantId,
          adjustmentType: 'multiply_by_two',
          quantity: 5,
          reason: 'Cycle Count Discrepancy',
        })
        .expect(400);
    });

    it('should reject negative adjustment quantity with 400 Bad Request', async () => {
      await request(server)
        .post('/api/v1/inventory/adjustments')
        .set('Authorization', `Bearer ${ctx.tokens.inventoryStaffToken}`)
        .send({
          variantId: testVariantId,
          adjustmentType: 'add',
          quantity: -5,
          reason: 'Cycle Count Discrepancy',
        })
        .expect(400);
    });
  });

  describe('GET /api/v1/inventory/movements', () => {
    it('should list historical stock movements ledger', async () => {
      const res = await request(server)
        .get('/api/v1/inventory/movements')
        .query({ variantId: testVariantId })
        .set('Authorization', `Bearer ${ctx.tokens.inventoryStaffToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('POST & PATCH /api/v1/inventory/requests', () => {
    it('should create stock replenishment request', async () => {
      const res = await request(server)
        .post('/api/v1/inventory/requests')
        .set('Authorization', `Bearer ${ctx.tokens.inventoryStaffToken}`)
        .send({
          urgency: 'Standard',
          notes: 'Replenishing showcase display',
          items: [
            {
              variantId: testVariantId,
              requestedQuantity: 10,
            },
          ],
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.status).toBe('Submitted');
      createdRequestId = res.body.data.id;
    });

    it('should list stock replenishment requests', async () => {
      const res = await request(server)
        .get('/api/v1/inventory/requests')
        .set('Authorization', `Bearer ${ctx.tokens.inventoryStaffToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should allow Store Manager with approve_stock_requests to approve', async () => {
      const res = await request(server)
        .patch(`/api/v1/inventory/requests/${createdRequestId}/approve`)
        .set('Authorization', `Bearer ${ctx.tokens.managerToken}`)
        .send({ notes: 'Approved for procurement' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Approved');
    });

    it('should deny Cashier from approving stock requests with 403', async () => {
      await request(server)
        .patch(`/api/v1/inventory/requests/${createdRequestId}/approve`)
        .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
        .send({ notes: 'Attempted approval' })
        .expect(403);
    });
  });

  describe('POST & POST complete /api/v1/inventory/counts', () => {
    it('should create a cycle count stocktake session', async () => {
      const res = await request(server)
        .post('/api/v1/inventory/counts')
        .set('Authorization', `Bearer ${ctx.tokens.inventoryStaffToken}`)
        .send({
          categoryOrBrand: 'Eyeglasses - Men',
          items: [
            {
              variantId: testVariantId,
              countedStock: 25,
            },
          ],
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      createdStocktakeId = res.body.data.id;
    });

    it('should list stocktake sessions', async () => {
      const res = await request(server)
        .get('/api/v1/inventory/counts')
        .set('Authorization', `Bearer ${ctx.tokens.inventoryStaffToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should complete stocktake session and reconcile variances', async () => {
      const res = await request(server)
        .post(`/api/v1/inventory/counts/${createdStocktakeId}/complete`)
        .set('Authorization', `Bearer ${ctx.tokens.managerToken}`)
        .send({ reconcileInventory: true })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(['Completed', 'Reconciled']).toContain(res.body.data.status);
    });
  });
});
