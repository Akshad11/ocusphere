import * as request from 'supertest';
import { TestAppContext } from './setup/test-app';

describe('Admin Access, Settings, Audit & System Health API (e2e)', () => {
  let ctx: TestAppContext;
  let server: any;

  beforeAll(async () => {
    ctx = await TestAppContext.create();
    server = ctx.app.getHttpServer();
  });

  afterAll(async () => {
    await ctx.close();
  });

  describe('GET /api/v1/health', () => {
    it('should return operational status publicly with 200 OK', async () => {
      const res = await request(server).get('/api/v1/health').expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ok');
      expect(res.body.data.timestamp).toBeDefined();
    });
  });

  describe('GET & PATCH /api/v1/settings', () => {
    it('should allow public access to view store configuration and operating hours', async () => {
      const res = await request(server).get('/api/v1/settings').expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.storeName).toBeDefined();
      expect(res.body.data.taxRatePercent).toBeDefined();
    });

    it('should deny unauthorized staff from modifying store settings with 403 Forbidden', async () => {
      await request(server)
        .patch('/api/v1/settings')
        .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
        .send({
          storeName: 'Hacked Store Name',
        })
        .expect(403);
    });

    it('should allow Admin with store_settings permission to update settings', async () => {
      const res = await request(server)
        .patch('/api/v1/settings')
        .set('Authorization', `Bearer ${ctx.tokens.adminToken}`)
        .send({
          storeName: 'OcuSphere Flagship Eyewear Studio',
          taxRatePercent: 12,
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.storeName).toBe('OcuSphere Flagship Eyewear Studio');
    });
  });

  describe('GET /api/v1/audit-logs', () => {
    it('should deny unauthenticated requests with 401 Unauthorized', async () => {
      await request(server).get('/api/v1/audit-logs').expect(401);
    });

    it('should deny non-admin staff without store_settings with 403 Forbidden', async () => {
      await request(server)
        .get('/api/v1/audit-logs')
        .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
        .expect(403);
    });

    it('should allow Admin to query immutable system audit logs', async () => {
      const res = await request(server)
        .get('/api/v1/audit-logs')
        .set('Authorization', `Bearer ${ctx.tokens.adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET & POST /api/v1/notifications', () => {
    it('should deny unauthenticated requests with 401 Unauthorized', async () => {
      await request(server).get('/api/v1/notifications').expect(401);
    });

    it('should list customer communications for authorized staff', async () => {
      const res = await request(server)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${ctx.tokens.managerToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should return 404 when retrying non-existent notification ID', async () => {
      await request(server)
        .post('/api/v1/notifications/non-existent-notif-id/retry')
        .set('Authorization', `Bearer ${ctx.tokens.managerToken}`)
        .expect(404);
    });
  });
});
