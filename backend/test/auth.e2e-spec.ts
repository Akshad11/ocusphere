import * as request from 'supertest';
import { TestAppContext } from './setup/test-app';

describe('Auth & Session API (e2e)', () => {
  let ctx: TestAppContext;
  let server: any;

  beforeAll(async () => {
    ctx = await TestAppContext.create();
    server = ctx.app.getHttpServer();
  });

  afterAll(async () => {
    await ctx.close();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should successfully authenticate seeded Admin and return JWT with cookie', async () => {
      const res = await request(server)
        .post('/api/v1/auth/login')
        .send({
          email: 'rajiv.singhal@ocusphere.in',
          password: 'OcuSphere@2026',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe('rajiv.singhal@ocusphere.in');
      expect(res.body.data.user.role).toBe('OWNER_ADMIN');
      expect(res.body.data.user.passwordHash).toBeUndefined();

      // Check cookie header
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const cookieArr = Array.isArray(cookies) ? cookies : [cookies];
      const hasJwtCookie = cookieArr.some((c: string) => c && c.includes('ocusphere_jwt='));
      expect(hasJwtCookie).toBe(true);
    });

    it('should reject invalid credentials with 401 Unauthorized', async () => {
      const res = await request(server)
        .post('/api/v1/auth/login')
        .send({
          email: 'rajiv.singhal@ocusphere.in',
          password: 'WrongPassword@123',
        })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject non-existent user email with 401 Unauthorized', async () => {
      const res = await request(server)
        .post('/api/v1/auth/login')
        .send({
          email: 'unknown.ghost@ocusphere.in',
          password: 'OcuSphere@2026',
        })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject missing password with 400 Bad Request', async () => {
      const res = await request(server)
        .post('/api/v1/auth/login')
        .send({
          email: 'rajiv.singhal@ocusphere.in',
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return current user profile using Bearer token', async () => {
      const res = await request(server)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${ctx.tokens.adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('rajiv.singhal@ocusphere.in');
      expect(res.body.data.role).toBe('OWNER_ADMIN');
      expect(res.body.data.passwordHash).toBeUndefined();
    });

    it('should return current user profile using cookie authentication', async () => {
      const res = await request(server)
        .get('/api/v1/auth/me')
        .set('Cookie', [`ocusphere_jwt=${ctx.tokens.adminToken}`])
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('rajiv.singhal@ocusphere.in');
    });

    it('should reject unauthenticated request with 401 Unauthorized', async () => {
      const res = await request(server).get('/api/v1/auth/me').expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /api/v1/auth/change-password', () => {
    it('should reject invalid current password with 400 Bad Request', async () => {
      const res = await request(server)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${ctx.tokens.storeAssistantToken}`)
        .send({
          currentPassword: 'IncorrectPassword',
          newPassword: 'NewSecurePassword@2026',
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should successfully update password with valid current password', async () => {
      // Create a dedicated isolated test user so shared role tokens are never disrupted
      const tempUserEmail = `temp.auth.${Date.now()}@ocusphere.in`;
      const tempUser = await ctx.prisma.user.create({
        data: {
          email: tempUserEmail,
          employeeCode: `EMP-${Date.now().toString().slice(-4)}`,
          passwordHash: await require('argon2').hash('InitialPassword@2026'),
          fullName: 'Temp Password User',
          phone: `99${Date.now().toString().slice(-8)}`,
          role: 'STORE_ASSISTANT',
          isActive: true,
        },
      });

      // Login as temp user
      const loginRes = await request(server)
        .post('/api/v1/auth/login')
        .send({
          email: tempUserEmail,
          password: 'InitialPassword@2026',
        });
      const tempToken = loginRes.body.data.accessToken;

      const res = await request(server)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${tempToken}`)
        .send({
          currentPassword: 'InitialPassword@2026',
          newPassword: 'UpdatedPassword@2026',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toBeDefined();

      // Clean up temp user
      await ctx.prisma.user.delete({ where: { id: tempUser.id } });
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should clear authentication cookie on logout', async () => {
      const res = await request(server)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${ctx.tokens.adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
    });
  });
});
