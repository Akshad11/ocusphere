import * as request from 'supertest';
import { TestAppContext } from './setup/test-app';

describe('Appointments & In-Store Reservations API (e2e)', () => {
  let ctx: TestAppContext;
  let server: any;
  let testVariantId: string;
  let testProductId: string;
  let createdAppointmentRef: string;
  let createdAppointmentId: string;
  let createdReservationId: string;
  let createdReservationRef: string;
  const testPhone = `9822${Math.floor(100000 + Math.random() * 900000)}`;

  beforeAll(async () => {
    ctx = await TestAppContext.create();
    server = ctx.app.getHttpServer();

    const variant = await ctx.prisma.productVariant.findFirst({
      include: { product: true },
    });
    if (!variant) throw new Error('No product variant available for testing reservations');
    testVariantId = variant.id;
    testProductId = variant.productId;
  });

  afterAll(async () => {
    await ctx.close();
  });

  describe('POST /api/v1/bookings/appointments', () => {
    it('should schedule an in-store optometry appointment (Public)', async () => {
      const res = await request(server)
        .post('/api/v1/bookings/appointments')
        .send({
          customerName: 'Ananya Deshmukh',
          customerPhone: testPhone,
          customerEmail: 'ananya.deshmukh@example.com',
          appointmentPurpose: 'Comprehensive Eye Examination',
          appointmentDate: '2026-11-10',
          timeSlot: '04:00 PM - 04:45 PM',
          notes: 'Looking for computer glasses evaluation.',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.referenceNumber).toMatch(/^APT-/);
      expect(res.body.data.status).toBe('Pending');

      createdAppointmentId = res.body.data.id;
      createdAppointmentRef = res.body.data.referenceNumber;
    });

    it('should reject appointment with missing required fields with 400 Bad Request', async () => {
      await request(server)
        .post('/api/v1/bookings/appointments')
        .send({ customerName: 'Incomplete' })
        .expect(400);
    });
  });

  describe('GET /api/v1/bookings/lookup', () => {
    it('should securely lookup booking using reference number and matching phone (Public)', async () => {
      const res = await request(server)
        .get('/api/v1/bookings/lookup')
        .query({
          referenceNumber: createdAppointmentRef,
          phone: testPhone,
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.referenceNumber).toBe(createdAppointmentRef);
      expect(res.body.data.customerPhone).toBe(testPhone);
    });

    it('should reject lookup with wrong phone number with 404 Not Found', async () => {
      await request(server)
        .get('/api/v1/bookings/lookup')
        .query({
          referenceNumber: createdAppointmentRef,
          phone: '9999999999',
        })
        .expect(404);
    });
  });

  describe('POST /api/v1/reservations', () => {
    it('should place an in-store product reservation and hold inventory (Public)', async () => {
      // Check stock before
      const variantBefore = await ctx.prisma.productVariant.findUnique({
        where: { id: testVariantId },
      });
      const reservedBefore = variantBefore?.reservedQuantity || 0;

      const res = await request(server)
        .post('/api/v1/reservations')
        .send({
          customerName: 'Pooja Sharma',
          customerPhone: testPhone,
          productId: testProductId,
          variantId: testVariantId,
          quantity: 1,
          pickupDate: '2026-11-12',
          pickupSlot: 'Evening (05:00 PM - 08:00 PM)',
          notes: 'Trial before prescription lens fitting',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.referenceNumber).toMatch(/^RES-/);
      expect(res.body.data.bookingType).toBe('reservation');

      createdReservationId = res.body.data.id;
      createdReservationRef = res.body.data.referenceNumber;

      // Verify reserved quantity incremented
      const variantAfter = await ctx.prisma.productVariant.findUnique({
        where: { id: testVariantId },
      });
      expect(variantAfter?.reservedQuantity).toBe(reservedBefore + 1);
    });
  });

  describe('POST /api/v1/reservations/:id/cancel', () => {
    it('should cancel reservation and release held stock (Public)', async () => {
      const variantBefore = await ctx.prisma.productVariant.findUnique({
        where: { id: testVariantId },
      });
      const reservedBefore = variantBefore?.reservedQuantity || 0;

      const res = await request(server)
        .post(`/api/v1/reservations/${createdReservationId}/cancel`)
        .send({ reason: 'Customer cancelled trial request' })
        .expect((res) => expect([200, 201]).toContain(res.status));

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Cancelled');

      // Verify reserved quantity released
      const variantAfter = await ctx.prisma.productVariant.findUnique({
        where: { id: testVariantId },
      });
      expect(variantAfter?.reservedQuantity).toBe(Math.max(0, reservedBefore - 1));
    });
  });

  describe('GET /api/v1/bookings & /api/v1/bookings/:id', () => {
    it('should list all bookings when authorized', async () => {
      const res = await request(server)
        .get('/api/v1/bookings')
        .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should retrieve single booking details by ID', async () => {
      const res = await request(server)
        .get(`/api/v1/bookings/${createdAppointmentId}`)
        .set('Authorization', `Bearer ${ctx.tokens.cashierToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdAppointmentId);
    });

    it('should deny Inventory Staff without manage_bookings with 403 Forbidden', async () => {
      await request(server)
        .get('/api/v1/bookings')
        .set('Authorization', `Bearer ${ctx.tokens.inventoryStaffToken}`)
        .expect(403);
    });
  });

  describe('PATCH /api/v1/bookings/:id/status', () => {
    it('should advance appointment status through valid lifecycle', async () => {
      const res = await request(server)
        .patch(`/api/v1/bookings/${createdAppointmentId}/status`)
        .set('Authorization', `Bearer ${ctx.tokens.managerToken}`)
        .send({
          status: 'Confirmed',
          note: 'Confirmed with patient via WhatsApp',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Confirmed');
      expect(Array.isArray(res.body.data.timeline)).toBe(true);
    });
  });
});
