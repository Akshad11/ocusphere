import * as request from 'supertest';
import { TestAppContext } from './setup/test-app';

describe('Customers & Prescriptions API (e2e)', () => {
  let ctx: TestAppContext;
  let server: any;
  let createdCustomerId: string;
  const testPhone = `9821${Math.floor(100000 + Math.random() * 900000)}`;

  beforeAll(async () => {
    ctx = await TestAppContext.create();
    server = ctx.app.getHttpServer();
  });

  afterAll(async () => {
    await ctx.close();
  });

  describe('POST /api/v1/customers', () => {
    it('should create new customer record when authorized', async () => {
      const res = await request(server)
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
        .send({
          firstName: 'Siddharth',
          lastName: 'Kapoor',
          phone: testPhone,
          email: `siddharth.${Date.now()}@testoptical.com`,
          address: {
            street: '15 Carter Road, Bandra West',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400050',
          },
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.customerCode).toBeDefined();
      expect(res.body.data.phone).toBe(testPhone);

      createdCustomerId = res.body.data.id;
    });

    it('should reject duplicate customer phone with 409 Conflict', async () => {
      const res = await request(server)
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
        .send({
          firstName: 'Another',
          lastName: 'Person',
          phone: testPhone, // Same phone
        })
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('should reject missing required firstName/phone with 400 Bad Request', async () => {
      await request(server)
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
        .send({ lastName: 'MissingFirstAndPhone' })
        .expect(400);
    });
  });

  describe('GET /api/v1/customers', () => {
    it('should return paginated customers list without leaking sensitive prescriptions in list view', async () => {
      const res = await request(server)
        .get('/api/v1/customers')
        .query({ search: 'Siddharth', page: 1, pageSize: 10 })
        .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta.total).toBeGreaterThan(0);

      // Verify privacy: prescriptions are excluded from the summary list
      const customer = res.body.data.find((c: any) => c.id === createdCustomerId);
      expect(customer).toBeDefined();
      expect(customer.prescriptions).toBeUndefined();
    });

    it('should reject unauthenticated request with 401', async () => {
      await request(server).get('/api/v1/customers').expect(401);
    });
  });

  describe('GET /api/v1/customers/:id', () => {
    it('should return customer profile details', async () => {
      const res = await request(server)
        .get(`/api/v1/customers/${createdCustomerId}`)
        .set('Authorization', `Bearer ${ctx.tokens.managerToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdCustomerId);
      expect(res.body.data.phone).toBe(testPhone);
    });

    it('should return 404 for non-existent customer ID', async () => {
      await request(server)
        .get('/api/v1/customers/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${ctx.tokens.managerToken}`)
        .expect(404);
    });
  });

  describe('PATCH /api/v1/customers/:id', () => {
    it('should update customer address and details', async () => {
      const res = await request(server)
        .patch(`/api/v1/customers/${createdCustomerId}`)
        .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
        .send({
          email: `updated.siddharth.${Date.now()}@testoptical.com`,
          address: {
            street: '22 Linking Road',
            city: 'Mumbai',
          },
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.address.street).toBe('22 Linking Road');
    });
  });

  describe('POST /api/v1/customers/:id/prescriptions', () => {
    it('should record an optometrist eye exam prescription when authorized', async () => {
      const res = await request(server)
        .post(`/api/v1/customers/${createdCustomerId}/prescriptions`)
        .set('Authorization', `Bearer ${ctx.tokens.managerToken}`)
        .send({
          optometristName: 'Dr. Vivek Saxena (Optom)',
          clinicOrBranch: 'Bandra West Flagship',
          rightSph: '-2.25',
          rightCyl: '-0.75',
          rightAxis: '90',
          leftSph: '-2.00',
          leftCyl: '-0.50',
          leftAxis: '85',
          pupillaryDistance: 63.5,
          lensTypeRecommended: 'Zeiss 1.60 Single Vision',
          coatingRecommended: 'DuraVision Platinum',
          notes: 'Astigmatism checked under subjective refraction',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.customerId).toBe(createdCustomerId);
      expect(res.body.data.rightSph).toBe('-2.25');
    });

    it('should deny staff lacking view_prescriptions permission from adding prescriptions with 403', async () => {
      await request(server)
        .post(`/api/v1/customers/${createdCustomerId}/prescriptions`)
        .set('Authorization', `Bearer ${ctx.tokens.storeAssistantToken}`)
        .send({
          optometristName: 'Assistant',
          clinicOrBranch: 'Bandra Flagship',
          rightSph: '-1.00',
          rightCyl: '0.00',
          rightAxis: '0',
          leftSph: '-1.00',
          leftCyl: '0.00',
          leftAxis: '0',
          pupillaryDistance: 60,
        })
        .expect(403);
    });
  });

  describe('GET /api/v1/customers/:id/sales & :id/bookings', () => {
    it('should retrieve customer sales history', async () => {
      const res = await request(server)
        .get(`/api/v1/customers/${createdCustomerId}/sales`)
        .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should retrieve customer bookings history', async () => {
      const res = await request(server)
        .get(`/api/v1/customers/${createdCustomerId}/bookings`)
        .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
