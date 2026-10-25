import * as request from 'supertest';
import { TestAppContext } from './setup/test-app';

describe('Suppliers & Vendors API (e2e)', () => {
  let ctx: TestAppContext;
  let server: any;
  let createdSupplierId: string;

  beforeAll(async () => {
    ctx = await TestAppContext.create();
    server = ctx.app.getHttpServer();
  });

  afterAll(async () => {
    await ctx.close();
  });

  describe('GET /api/v1/suppliers', () => {
    it('should deny unauthenticated requests with 401 Unauthorized', async () => {
      await request(server).get('/api/v1/suppliers').expect(401);
    });

    it('should deny staff without manage_suppliers permission with 403 Forbidden', async () => {
      await request(server)
        .get('/api/v1/suppliers')
        .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
        .expect(403);
    });

    it('should list all optical vendors for Admin', async () => {
      const res = await request(server)
        .get('/api/v1/suppliers')
        .set('Authorization', `Bearer ${ctx.tokens.adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('POST /api/v1/suppliers', () => {
    it('should reject supplier creation with missing required fields with 400 Bad Request', async () => {
      const res = await request(server)
        .post('/api/v1/suppliers')
        .set('Authorization', `Bearer ${ctx.tokens.adminToken}`)
        .send({
          // missing businessName, contactPerson, email, phone
          paymentTermsDays: 30,
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should register a new optical vendor successfully', async () => {
      const res = await request(server)
        .post('/api/v1/suppliers')
        .set('Authorization', `Bearer ${ctx.tokens.adminToken}`)
        .send({
          businessName: 'Seiko Optical India Pvt Ltd',
          contactPerson: 'Vikram Joshi',
          email: 'vikram.joshi@seiko-optical.in',
          phone: '9820011223',
          address: '401 Trade Centre, BKC',
          city: 'Mumbai',
          state: 'Maharashtra',
          taxId: '27AABCS1234F1Z5',
          paymentTerms: 'Net 45',
          notes: 'Premium Japanese progressive lens laboratory',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.businessName).toBe('Seiko Optical India Pvt Ltd');
      expect(res.body.data.paymentTerms).toBe('Net 45');

      createdSupplierId = res.body.data.id;
    });
  });

  describe('GET /api/v1/suppliers/:id', () => {
    it('should retrieve supplier details and purchase orders history', async () => {
      const res = await request(server)
        .get(`/api/v1/suppliers/${createdSupplierId}`)
        .set('Authorization', `Bearer ${ctx.tokens.adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdSupplierId);
      expect(Array.isArray(res.body.data.purchaseOrders)).toBe(true);
    });

    it('should return 404 for non-existent supplier ID', async () => {
      await request(server)
        .get('/api/v1/suppliers/non-existent-supplier-id')
        .set('Authorization', `Bearer ${ctx.tokens.adminToken}`)
        .expect(404);
    });
  });

  describe('PATCH /api/v1/suppliers/:id', () => {
    it('should update supplier details and payment terms', async () => {
      const res = await request(server)
        .patch(`/api/v1/suppliers/${createdSupplierId}`)
        .set('Authorization', `Bearer ${ctx.tokens.adminToken}`)
        .send({
          paymentTerms: 'Net 60',
          contactPerson: 'Vikram Joshi (Senior VP)',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.paymentTerms).toBe('Net 60');
      expect(res.body.data.contactPerson).toBe('Vikram Joshi (Senior VP)');
    });
  });
});
