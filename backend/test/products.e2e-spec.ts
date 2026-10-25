import * as request from 'supertest';
import { TestAppContext } from './setup/test-app';
import { mockValidProduct } from './setup/fixtures';

describe('Product Catalogue, Categories & Brands API (e2e)', () => {
  let ctx: TestAppContext;
  let server: any;
  let createdProductId: string;
  let createdProductSlug: string;

  beforeAll(async () => {
    ctx = await TestAppContext.create();
    server = ctx.app.getHttpServer();
  });

  afterAll(async () => {
    await ctx.close();
  });

  describe('GET /api/v1/categories & /api/v1/brands', () => {
    it('should list all eyewear categories (Public)', async () => {
      const res = await request(server).get('/api/v1/categories').expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should list all optical brands (Public)', async () => {
      const res = await request(server).get('/api/v1/brands').expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should create a new category when authorized', async () => {
      const res = await request(server)
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${ctx.tokens.managerToken}`)
        .send({
          name: `Sports Eyewear ${Date.now()}`,
          description: 'High-impact cycling and athletic frames',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
    });

    it('should deny Cashier from creating a category with 403', async () => {
      await request(server)
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
        .send({ name: 'Unpermitted Category' })
        .expect(403);
    });
  });

  describe('POST /api/v1/products', () => {
    it('should create a multi-variant optical product when authorized', async () => {
      const res = await request(server)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${ctx.tokens.managerToken}`)
        .send(mockValidProduct)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.slug).toBeDefined();
      expect(res.body.data.variants.length).toBe(2);

      createdProductId = res.body.data.id;
      createdProductSlug = res.body.data.slug;
    });

    it('should reject duplicate variant SKU with 409 Conflict', async () => {
      const res = await request(server)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${ctx.tokens.adminToken}`)
        .send(mockValidProduct)
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('should deny Cashier from creating products with 403 Forbidden', async () => {
      await request(server)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
        .send(mockValidProduct)
        .expect(403);
    });
  });

  describe('GET /api/v1/products', () => {
    it('should return paginated products list with search and filters (Public)', async () => {
      const res = await request(server)
        .get('/api/v1/products')
        .query({ search: 'Aviator', page: 1, pageSize: 5 })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta.total).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/products/slug/:slug & /api/v1/products/:id', () => {
    it('should retrieve product by SEO slug (Public)', async () => {
      const res = await request(server)
        .get(`/api/v1/products/slug/${createdProductSlug}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdProductId);
      expect(res.body.data.variants.length).toBe(2);
    });

    it('should retrieve product by ID (Public)', async () => {
      const res = await request(server)
        .get(`/api/v1/products/${createdProductId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdProductId);
    });

    it('should return 404 for non-existent product ID', async () => {
      const res = await request(server)
        .get('/api/v1/products/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('PATCH /api/v1/products/:id', () => {
    it('should update product details when authorized', async () => {
      const res = await request(server)
        .patch(`/api/v1/products/${createdProductId}`)
        .set('Authorization', `Bearer ${ctx.tokens.managerToken}`)
        .send({
          basePrice: 13999,
          description: 'Updated aerospace titanium aviator frames.',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Number(res.body.data.basePrice)).toBe(13999);
      expect(res.body.data.description).toBe('Updated aerospace titanium aviator frames.');
    });
  });

  describe('DELETE /api/v1/products/:id', () => {
    it('should delete or archive product when authorized', async () => {
      const res = await request(server)
        .delete(`/api/v1/products/${createdProductId}`)
        .set('Authorization', `Bearer ${ctx.tokens.adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);

      // Verify product is archived or gone
      const getRes = await request(server).get(`/api/v1/products/${createdProductId}`);
      expect(getRes.status === 404 || getRes.body?.data?.status === 'archived').toBe(true);
    });
  });
});
