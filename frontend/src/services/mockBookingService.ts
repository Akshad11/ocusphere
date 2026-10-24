import { Booking, BookingStatus, BookingType, CreateAppointmentInput, CreateReservationInput } from '../types/booking.types';
import { generateBookingReference } from '../utils/formatting';
import { mockStore, simulateNetwork } from './mockApiClient';

export interface BookingService {
  list(params?: {
    type?: BookingType | 'all';
    status?: BookingStatus | 'all';
    search?: string;
    date?: string;
  }): Promise<Booking[]>;
  getById(id: string): Promise<Booking>;
  getByReference(ref: string): Promise<Booking>;
  createAppointment(input: CreateAppointmentInput): Promise<Booking>;
  createReservation(input: CreateReservationInput): Promise<Booking>;
  updateStatus(id: string, newStatus: BookingStatus, note?: string, actor?: string): Promise<Booking>;
  reschedule(id: string, newDate: string, newTimeSlot: string, actor?: string): Promise<Booking>;
}

class MockBookingServiceImpl implements BookingService {
  async list(params = {} as { type?: string; status?: string; search?: string; date?: string }): Promise<Booking[]> {
    let items = [...mockStore.bookings];

    if (params.type && params.type !== 'all') {
      items = items.filter((b) => b.bookingType === params.type);
    }

    if (params.status && params.status !== 'all') {
      items = items.filter((b) => b.status === params.status);
    }

    if (params.date) {
      items = items.filter((b) => b.appointmentDate === params.date || (b.pickupWindowStart && b.pickupWindowStart.startsWith(params.date!)));
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (b) =>
          b.customerName.toLowerCase().includes(q) ||
          b.customerPhone.includes(q) ||
          b.referenceNumber.toLowerCase().includes(q)
      );
    }

    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return simulateNetwork(items);
  }

  async getById(id: string): Promise<Booking> {
    const b = mockStore.bookings.find((item) => item.id === id);
    if (!b) throw new Error(`Booking ${id} not found`);
    return simulateNetwork(b);
  }

  async getByReference(ref: string): Promise<Booking> {
    const cleanRef = ref.trim().toUpperCase();
    const b = mockStore.bookings.find((item) => item.referenceNumber.toUpperCase() === cleanRef);
    if (!b) throw new Error(`Booking with reference "${ref}" was not found`);
    return simulateNetwork(b);
  }

  async createAppointment(input: CreateAppointmentInput): Promise<Booking> {
    const seq = mockStore.bookings.filter((b) => b.bookingType === 'appointment').length + 1001;
    const ref = generateBookingReference('appointment', seq);
    const id = `book-${Date.now()}`;

    const newBooking: Booking = {
      id,
      referenceNumber: ref,
      bookingType: 'appointment',
      status: 'Pending',
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerEmail: input.customerEmail,
      appointmentPurpose: input.appointmentPurpose,
      appointmentDate: input.appointmentDate,
      timeSlot: input.timeSlot,
      notes: input.notes,
      timeline: [
        {
          status: 'Pending',
          timestamp: new Date().toISOString(),
          note: 'Customer requested appointment through online booking portal',
          actor: `${input.customerName} (Online)`,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockStore.bookings.unshift(newBooking);
    mockStore.save('bookings', mockStore.bookings);

    // Notify
    mockStore.notifications.unshift({
      id: `notif-${Date.now()}`,
      channel: 'SMS',
      recipient: input.customerPhone,
      recipientName: input.customerName,
      template: 'Appointment Confirmation',
      title: 'Appointment Request Received',
      messageContent: `Hello ${input.customerName}, your appointment for ${input.appointmentPurpose} on ${input.appointmentDate} (${input.timeSlot}) has been received. Reference: ${ref}.`,
      status: 'Sent',
      attemptCount: 1,
      lastAttemptAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    mockStore.save('notifications', mockStore.notifications);

    return simulateNetwork(newBooking);
  }

  async createReservation(input: CreateReservationInput): Promise<Booking> {
    const seq = mockStore.bookings.filter((b) => b.bookingType === 'reservation').length + 2001;
    const ref = generateBookingReference('reservation', seq);
    const id = `book-${Date.now()}`;

    // Find product and variant to reserve
    let foundProduct: any = null;
    let foundVariant: any = null;
    for (const prod of mockStore.products) {
      if (prod.id === input.productId) {
        foundProduct = prod;
        foundVariant = prod.variants.find((v) => v.id === input.variantId);
        break;
      }
    }

    if (!foundVariant || !foundProduct) {
      throw new Error('Selected frame or variant not found');
    }

    // Reserve quantity
    foundVariant.reservedQuantity = (foundVariant.reservedQuantity || 0) + input.quantity;
    mockStore.save('products', mockStore.products);

    const pickupStart = `${input.pickupDate}T10:00:00Z`;
    const pickupEnd = new Date(new Date(pickupStart).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();

    const newBooking: Booking = {
      id,
      referenceNumber: ref,
      bookingType: 'reservation',
      status: 'Pending',
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerEmail: input.customerEmail,
      reservedItems: [
        {
          productId: foundProduct.id,
          productName: foundProduct.name,
          variantId: foundVariant.id,
          variantSku: foundVariant.variantSku,
          colorName: foundVariant.colorName,
          size: foundVariant.size,
          quantity: input.quantity,
          unitPrice: foundVariant.sellingPrice,
          imageUrl: foundProduct.featuredImage,
        },
      ],
      pickupWindowStart: pickupStart,
      pickupWindowEnd: pickupEnd,
      notes: input.notes,
      timeline: [
        {
          status: 'Pending',
          timestamp: new Date().toISOString(),
          note: `Requested in-store trial and hold for ${foundProduct.name} (${foundVariant.colorName})`,
          actor: `${input.customerName} (Online)`,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockStore.bookings.unshift(newBooking);
    mockStore.save('bookings', mockStore.bookings);

    mockStore.notifications.unshift({
      id: `notif-${Date.now()}`,
      channel: 'WhatsApp',
      recipient: input.customerPhone,
      recipientName: input.customerName,
      template: 'Reservation Confirmation',
      title: 'Eyewear Reservation Placed',
      messageContent: `Namaste ${input.customerName}, reservation ${ref} is confirmed. We have set aside ${foundProduct.name} for 3 business days until ${pickupEnd.split('T')[0]}.`,
      status: 'Sent',
      attemptCount: 1,
      lastAttemptAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    mockStore.save('notifications', mockStore.notifications);

    return simulateNetwork(newBooking);
  }

  async updateStatus(
    id: string,
    newStatus: BookingStatus,
    note?: string,
    actor: string = 'Store Staff'
  ): Promise<Booking> {
    const booking = mockStore.bookings.find((b) => b.id === id);
    if (!booking) throw new Error(`Booking ${id} not found`);

    const prevStatus = booking.status;
    booking.status = newStatus;
    booking.updatedAt = new Date().toISOString();
    booking.timeline.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: note || `Status updated from ${prevStatus} to ${newStatus}`,
      actor,
    });

    // Handle reserved quantity adjustments if reservation cancelled / collected / expired
    if (booking.bookingType === 'reservation' && booking.reservedItems) {
      if (['Cancelled', 'Expired', 'Collected'].includes(newStatus) && !['Cancelled', 'Expired', 'Collected'].includes(prevStatus)) {
        booking.reservedItems.forEach((item) => {
          for (const prod of mockStore.products) {
            const v = prod.variants.find((variant) => variant.id === item.variantId);
            if (v && v.reservedQuantity > 0) {
              v.reservedQuantity = Math.max(0, v.reservedQuantity - item.quantity);
              // if collected, decrement stockOnHand as well
              if (newStatus === 'Collected') {
                v.stockOnHand = Math.max(0, v.stockOnHand - item.quantity);
              }
              break;
            }
          }
        });
        mockStore.save('products', mockStore.products);
      }
    }

    mockStore.save('bookings', mockStore.bookings);

    // If marked ready for pickup, trigger notification
    if (newStatus === 'Ready for pickup') {
      mockStore.notifications.unshift({
        id: `notif-${Date.now()}`,
        channel: 'SMS',
        recipient: booking.customerPhone,
        recipientName: booking.customerName,
        template: 'Ready for Pickup',
        title: 'Ready for Pickup',
        messageContent: `Hello ${booking.customerName}, your reservation ${booking.referenceNumber} is ready for trial & collection at OcuSphere Bandra.`,
        status: 'Delivered',
        attemptCount: 1,
        lastAttemptAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
      mockStore.save('notifications', mockStore.notifications);
    }

    return simulateNetwork(booking);
  }

  async reschedule(id: string, newDate: string, newTimeSlot: string, actor: string = 'Store Front Desk'): Promise<Booking> {
    const booking = mockStore.bookings.find((b) => b.id === id);
    if (!booking) throw new Error(`Booking ${id} not found`);

    booking.appointmentDate = newDate;
    booking.timeSlot = newTimeSlot;
    booking.updatedAt = new Date().toISOString();
    booking.timeline.push({
      status: booking.status,
      timestamp: new Date().toISOString(),
      note: `Rescheduled to ${newDate} at ${newTimeSlot}`,
      actor,
    });

    mockStore.save('bookings', mockStore.bookings);
    return simulateNetwork(booking);
  }
}

import { apiBookingService } from './apiServices';

const isMock = (import.meta as any).env?.VITE_DATA_MODE === 'mock';
export const mockBookingService: BookingService = isMock ? new MockBookingServiceImpl() : apiBookingService;
