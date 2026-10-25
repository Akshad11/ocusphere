import * as request from 'supertest';
import { TestAppContext } from './setup/test-app';

describe('Staff, Roles & Permissions API (e2e)', () => {
  let ctx: TestAppContext;
  let server: any;
  let createdStaffId: string;

  beforeAll(async () => {
    ctx = await TestAppContext.create();
    server = ctx.app.getHttpServer();
  });

  afterAll(async () => {
    await ctx.close();
  });

  describe('GET /api/v1/roles', () => {
    it('should return role definitions and all system permissions for authenticated user', async () => {
      const res = await request(server)
        .get('/api/v1/roles')
        .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.roles)).toBe(true);
      expect(res.body.data.roles.length).toBeGreaterThanOrEqual(5);
      expect(Array.isArray(res.body.data.allPermissions)).toBe(true);
    });

    it('should reject unauthenticated request with 401', async () => {
      await request(server).get('/api/v1/roles').expect(401);
    });
  });

  describe('GET /api/v1/staff', () => {
    it('should allow Owner/Admin to list all staff members with permissions', async () => {
      const res = await request(server)
        .get('/api/v1/staff')
        .set('Authorization', `Bearer ${ctx.tokens.adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(5);

      const adminUser = res.body.data.find((u: any) => u.email === 'rajiv.singhal@ocusphere.in');
      expect(adminUser).toBeDefined();
      expect(adminUser.role).toBe('OWNER_ADMIN');
      expect(adminUser.permissions).toContain('manage_staff');
    });

    it('should deny Cashier without manage_staff permission with 403 Forbidden', async () => {
      const res = await request(server)
        .get('/api/v1/staff')
        .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('POST /api/v1/staff', () => {
    it('should create new staff member with valid data', async () => {
      const uniqueCode = `EMP-T${Date.now().toString().slice(-4)}`;
      const uniqueEmail = `test.optom.${Date.now()}@ocusphere.in`;

      const res = await request(server)
        .post('/api/v1/staff')
        .set('Authorization', `Bearer ${ctx.tokens.adminToken}`)
        .send({
          employeeCode: uniqueCode,
          fullName: 'Dr. Neha Bansal',
          email: uniqueEmail,
          phone: '9820099887',
          role: 'STORE_ASSISTANT',
          password: 'OcuSphere@2026',
          customPermissions: ['manage_bookings', 'view_prescriptions'],
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.fullName).toBe('Dr. Neha Bansal');
      createdStaffId = res.body.data.id;
    });

    it('should reject duplicate employeeCode or email with 409 Conflict', async () => {
      const res = await request(server)
        .post('/api/v1/staff')
        .set('Authorization', `Bearer ${ctx.tokens.adminToken}`)
        .send({
          employeeCode: 'EMP-001', // Already exists for Rajiv Singhal
          fullName: 'Duplicate Employee',
          email: 'duplicate@ocusphere.in',
          phone: '9820011223',
          role: 'CASHIER',
        })
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('should reject invalid role with 400 Bad Request', async () => {
      const res = await request(server)
        .post('/api/v1/staff')
        .set('Authorization', `Bearer ${ctx.tokens.adminToken}`)
        .send({
          employeeCode: `EMP-${Date.now().toString().slice(-4)}`,
          fullName: 'Invalid Role Staff',
          email: `invalid.${Date.now()}@ocusphere.in`,
          phone: '9820011999',
          role: 'SUPER_HERO',
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/staff/:id', () => {
    it('should return specific staff member details', async () => {
      const res = await request(server)
        .get(`/api/v1/staff/${createdStaffId}`)
        .set('Authorization', `Bearer ${ctx.tokens.adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdStaffId);
      expect(res.body.data.fullName).toBe('Dr. Neha Bansal');
    });

    it('should return 404 for non-existent staff ID', async () => {
      const res = await request(server)
        .get('/api/v1/staff/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${ctx.tokens.adminToken}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('PATCH /api/v1/staff/:id', () => {
    it('should update staff member details', async () => {
      const res = await request(server)
        .patch(`/api/v1/staff/${createdStaffId}`)
        .set('Authorization', `Bearer ${ctx.tokens.adminToken}`)
        .send({
          phone: '9820099000',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.phone).toBe('9820099000');
    });
  });

  describe('DELETE /api/v1/staff/:id', () => {
    it('should deactivate staff member account', async () => {
      const res = await request(server)
        .delete(`/api/v1/staff/${createdStaffId}`)
        .set('Authorization', `Bearer ${ctx.tokens.adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should deny self-deactivation with 400 Bad Request', async () => {
      const meRes = await request(server)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${ctx.tokens.adminToken}`);

      const res = await request(server)
        .delete(`/api/v1/staff/${meRes.body.data.id}`)
        .set('Authorization', `Bearer ${ctx.tokens.adminToken}`)
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });
});
