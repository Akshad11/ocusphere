import * as request from 'supertest';
import { TestAppContext } from './setup/test-app';

describe('Reports & Retail Analytics API (e2e)', () => {
  let ctx: TestAppContext;
  let server: any;

  beforeAll(async () => {
    ctx = await TestAppContext.create();
    server = ctx.app.getHttpServer();
  });

  afterAll(async () => {
    await ctx.close();
  });

  describe('GET /api/v1/reports/dashboard', () => {
    it('should deny unauthenticated requests with 401', async () => {
      await request(server).get('/api/v1/reports/dashboard').expect(401);
    });

    it('should deny staff without view_financial_reports with 403', async () => {
      await request(server)
        .get('/api/v1/reports/dashboard')
        .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
        .expect(403);
    });

    it('should return executive KPI dashboard metrics for Admin and Manager', async () => {
      const res = await request(server)
        .get('/api/v1/reports/dashboard')
        .set('Authorization', `Bearer ${ctx.tokens.managerToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(typeof res.body.data.totalRevenue).toBe('number');
      expect(typeof res.body.data.totalOrders).toBe('number');
      expect(typeof res.body.data.totalCustomers).toBe('number');
      expect(res.body.data.inventoryValuation).toBeDefined();
    });
  });

  describe('GET /api/v1/reports/sales', () => {
    it('should return detailed sales report breakdown by date range', async () => {
      const res = await request(server)
        .get('/api/v1/reports/sales?startDate=2026-01-01&endDate=2026-12-31')
        .set('Authorization', `Bearer ${ctx.tokens.adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  describe('GET /api/v1/reports/inventory', () => {
    it('should allow inventory staff with adjust_inventory to fetch valuation report', async () => {
      const res = await request(server)
        .get('/api/v1/reports/inventory')
        .set('Authorization', `Bearer ${ctx.tokens.inventoryStaffToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });
});
