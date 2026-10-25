import * as request from 'supertest';
import { TestAppContext } from './setup/test-app';

describe('Marketing Offers & Coupons API (e2e)', () => {
  let ctx: TestAppContext;
  let server: any;
  let createdOfferId: string;
  let activeCouponCode = 'FESTIVE15';

  beforeAll(async () => {
    ctx = await TestAppContext.create();
    server = ctx.app.getHttpServer();
  });

  afterAll(async () => {
    await ctx.close();
  });

  describe('GET /api/v1/offers', () => {
    it('should allow public access to list active offers', async () => {
      const res = await request(server).get('/api/v1/offers').expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /api/v1/offers', () => {
    it('should deny unauthenticated requests with 401', async () => {
      await request(server)
        .post('/api/v1/offers')
        .send({
          title: 'Diwali Mega Sale',
          description: 'Special seasonal promotion',
          discountType: 'percentage',
          discountValue: 20,
          validFrom: '2026-10-01',
          validUntil: '2026-11-30',
        })
        .expect(401);
    });

    it('should deny staff without manage_offers permission with 403', async () => {
      await request(server)
        .post('/api/v1/offers')
        .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
        .send({
          title: 'Diwali Mega Sale',
          description: 'Special seasonal promotion',
          discountType: 'percentage',
          discountValue: 20,
          validFrom: '2026-10-01',
          validUntil: '2026-11-30',
        })
        .expect(403);
    });

    it('should create a promotional campaign with coupon code for Admin', async () => {
      const uniqueCode = `OFFER${Date.now().toString().slice(-4)}`;

      const res = await request(server)
        .post('/api/v1/offers')
        .set('Authorization', `Bearer ${ctx.tokens.adminToken}`)
        .send({
          name: 'Seasonal Winter Festival',
          description: 'Flat 20% discount on premium eyewear',
          discountType: 'Percentage',
          discountValue: 20,
          minimumPurchase: 2000,
          maximumDiscount: 1000,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
          coupons: [
            {
              code: uniqueCode,
              usageLimit: 100,
              perCustomerLimit: 2,
              expiryDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
            },
          ],
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.name).toBe('Seasonal Winter Festival');

      createdOfferId = res.body.data.id;
    });
  });

  describe('GET /api/v1/offers/:id', () => {
    it('should retrieve offer details publicly', async () => {
      const res = await request(server)
        .get(`/api/v1/offers/${createdOfferId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdOfferId);
    });

    it('should return 404 for non-existent offer ID', async () => {
      await request(server).get('/api/v1/offers/non-existent-offer-id').expect(404);
    });
  });

  describe('GET /api/v1/coupons', () => {
    it('should list all coupon codes for staff with manage_offers', async () => {
      const res = await request(server)
        .get('/api/v1/coupons')
        .set('Authorization', `Bearer ${ctx.tokens.adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('POST /api/v1/coupons/validate', () => {
    it('should validate eligible coupon code and calculate discount publicly', async () => {
      const res = await request(server)
        .post('/api/v1/coupons/validate')
        .send({
          code: activeCouponCode,
          subtotal: 5000,
        })
        .expect((res) => expect([200, 201]).toContain(res.status));

      expect(res.body.success).toBe(true);
      expect(res.body.data.isValid).toBe(true);
      expect(res.body.data.discountAmount).toBeGreaterThan(0);
    });

    it('should reject non-existent or invalid coupon code with 400', async () => {
      const res = await request(server)
        .post('/api/v1/coupons/validate')
        .send({
          code: 'INVALID_CODE_999',
          subtotal: 5000,
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error?.message || res.body.message).toMatch(/invalid or has been deactivated/i);
    });

    it('should reject coupon when order amount is below minimumPurchase with 400', async () => {
      const res = await request(server)
        .post('/api/v1/coupons/validate')
        .send({
          code: activeCouponCode,
          subtotal: 100, // below minimum purchase
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error?.message || res.body.message).toMatch(/minimum purchase/i);
    });
  });

  describe('POST /api/v1/coupons/redeem', () => {
    it('should deny unauthenticated requests to redeem with 401', async () => {
      await request(server)
        .post('/api/v1/coupons/redeem')
        .send({
          code: activeCouponCode,
          customerPhone: '9820011222',
          subtotal: 4000,
        })
        .expect(401);
    });

    it('should redeem coupon when authorized at POS', async () => {
      const freshPhone = `98${Date.now().toString().slice(-8)}`;

      const res = await request(server)
        .post('/api/v1/coupons/redeem')
        .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
        .send({
          code: activeCouponCode,
          customerPhone: freshPhone,
          subtotal: 4000,
        })
        .expect((res) => expect([200, 201]).toContain(res.status));

      expect(res.body.success).toBe(true);
      expect(res.body.data.redemption).toBeDefined();
      expect(res.body.data.validation.discountAmount).toBeGreaterThan(0);
    });
  });
});
