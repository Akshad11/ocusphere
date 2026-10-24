import { Booking } from '../types/booking.types';

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'book-001',
    referenceNumber: 'APT-2026-1001',
    bookingType: 'appointment',
    status: 'Arrived',
    customerName: 'Aarav Sharma',
    customerPhone: '9820123456',
    customerEmail: 'aarav.sharma@example.in',
    customerId: 'cust-001',
    appointmentPurpose: 'Comprehensive Eye Exam',
    appointmentDate: '2026-10-24',
    timeSlot: '10:45 AM - 11:30 AM',
    assignedOptometrist: 'Dr. Neha Kulkarni, M.Optom',
    notes: 'Experiencing asthenopia (eye fatigue) with high dual-screen workload.',
    timeline: [
      { status: 'Pending', timestamp: '2026-10-22T09:14:00Z', note: 'Booked online via website', actor: 'Aarav Sharma (Customer)' },
      { status: 'Confirmed', timestamp: '2026-10-22T10:00:00Z', note: 'Slot verified by store front desk', actor: 'Front Desk (Simran)' },
      { status: 'Arrived', timestamp: '2026-10-24T10:40:00Z', note: 'Customer checked in at reception', actor: 'Front Desk (Simran)' }
    ],
    createdAt: '2026-10-22T09:14:00Z',
    updatedAt: '2026-10-24T10:40:00Z'
  },
  {
    id: 'book-002',
    referenceNumber: 'RES-2026-2001',
    bookingType: 'reservation',
    status: 'Ready for pickup',
    customerName: 'Priya Nair',
    customerPhone: '9840234567',
    customerEmail: 'priya.nair@example.in',
    customerId: 'cust-002',
    reservedItems: [
      {
        productId: 'prod-001',
        productName: 'AeroLight Titanium Round',
        variantId: 'var-001-2',
        variantSku: 'OC-TI101-GLD-M',
        colorName: 'Champagne Gold',
        size: 'Medium (50-19-145)',
        quantity: 1,
        unitPrice: 5299,
      }
    ],
    pickupWindowStart: '2026-10-24T12:00:00Z',
    pickupWindowEnd: '2026-10-27T20:00:00Z',
    notes: 'Hold for store pickup. Customer will test fit with optometrist.',
    timeline: [
      { status: 'Pending', timestamp: '2026-10-23T11:20:00Z', note: 'Reservation requested online', actor: 'Priya Nair (Customer)' },
      { status: 'Confirmed', timestamp: '2026-10-23T11:45:00Z', note: 'Stock located on shelf', actor: 'Inventory Staff (Karan)' },
      { status: 'Preparing', timestamp: '2026-10-23T14:10:00Z', note: 'Packed with optical cleaner set in pickup bay A-3', actor: 'Inventory Staff (Karan)' },
      { status: 'Ready for pickup', timestamp: '2026-10-23T14:30:00Z', note: 'Ready for customer collection notification sent', actor: 'System' }
    ],
    createdAt: '2026-10-23T11:20:00Z',
    updatedAt: '2026-10-23T14:30:00Z'
  },
  {
    id: 'book-003',
    referenceNumber: 'APT-2026-1002',
    bookingType: 'appointment',
    status: 'Confirmed',
    customerName: 'Vikram Singhania',
    customerPhone: '9811345678',
    customerEmail: 'vikram.singhania@example.in',
    customerId: 'cust-003',
    appointmentPurpose: 'Frame Styling & Fitting',
    appointmentDate: '2026-10-24',
    timeSlot: '02:00 PM - 02:45 PM',
    assignedOptometrist: 'Dr. Rohan Menon, F.A.A.O',
    notes: 'Interested in bespoke luxury frames: Lindberg or DITA Statesman.',
    timeline: [
      { status: 'Pending', timestamp: '2026-10-23T16:00:00Z', note: 'Booking initiated by customer', actor: 'Vikram Singhania (Customer)' },
      { status: 'Confirmed', timestamp: '2026-10-23T16:30:00Z', note: 'Confirmed with personal styling consultant', actor: 'Store Manager (Kavita)' }
    ],
    createdAt: '2026-10-23T16:00:00Z',
    updatedAt: '2026-10-23T16:30:00Z'
  },
  {
    id: 'book-004',
    referenceNumber: 'RES-2026-2002',
    bookingType: 'reservation',
    status: 'Preparing',
    customerName: 'Ananya Deshmukh',
    customerPhone: '9769456789',
    customerEmail: 'ananya.d@example.in',
    customerId: 'cust-004',
    reservedItems: [
      {
        productId: 'prod-007',
        productName: 'Acuvue Oasys with HydraLuxe Daily (30pk)',
        variantId: 'var-007-1',
        variantSku: 'JJ-OASYS-BC85-DIA143',
        colorName: 'Clear Visibility Tint',
        size: 'BC 8.5 / DIA 14.3',
        quantity: 2,
        unitPrice: 2450,
      }
    ],
    pickupWindowStart: '2026-10-24T14:00:00Z',
    pickupWindowEnd: '2026-10-26T21:00:00Z',
    notes: 'Regular replenishment of monthly contact supply.',
    timeline: [
      { status: 'Pending', timestamp: '2026-10-24T08:30:00Z', note: 'Order placed for store pickup', actor: 'Ananya Deshmukh (Customer)' },
      { status: 'Confirmed', timestamp: '2026-10-24T09:00:00Z', note: 'Confirmed item availability', actor: 'Kavita (Store Manager)' },
      { status: 'Preparing', timestamp: '2026-10-24T09:30:00Z', note: 'Being bundled at counter', actor: 'Karan (Inventory Staff)' }
    ],
    createdAt: '2026-10-24T08:30:00Z',
    updatedAt: '2026-10-24T09:30:00Z'
  },
  {
    id: 'book-005',
    referenceNumber: 'APT-2026-1003',
    bookingType: 'appointment',
    status: 'Pending',
    customerName: 'Rohan Mehta',
    customerPhone: '9821567890',
    customerEmail: 'rohan.mehta@example.in',
    customerId: 'cust-005',
    appointmentPurpose: 'Contact Lens Consultation',
    appointmentDate: '2026-10-25',
    timeSlot: '11:30 AM - 12:15 PM',
    notes: 'First time contact lens wearer, needs trial fitting & tutorial.',
    timeline: [
      { status: 'Pending', timestamp: '2026-10-24T07:15:00Z', note: 'Requested slot via web app', actor: 'Rohan Mehta (Customer)' }
    ],
    createdAt: '2026-10-24T07:15:00Z',
    updatedAt: '2026-10-24T07:15:00Z'
  },
  {
    id: 'book-006',
    referenceNumber: 'APT-2026-1004',
    bookingType: 'appointment',
    status: 'Completed',
    customerName: 'Kavita Iyer',
    customerPhone: '9841678901',
    customerEmail: 'kavita.iyer@example.in',
    customerId: 'cust-006',
    appointmentPurpose: 'Prescription Verification',
    appointmentDate: '2026-10-23',
    timeSlot: '04:15 PM - 05:00 PM',
    assignedOptometrist: 'Dr. Neha Kulkarni, M.Optom',
    notes: 'Verified external ophthalmologist prescription and fitted sunglasses.',
    timeline: [
      { status: 'Confirmed', timestamp: '2026-10-21T10:00:00Z', actor: 'Front Desk' },
      { status: 'Arrived', timestamp: '2026-10-23T16:10:00Z', actor: 'Front Desk' },
      { status: 'Completed', timestamp: '2026-10-23T17:05:00Z', note: 'Consultation concluded, order placed for Ray-Ban Polarized', actor: 'Dr. Neha Kulkarni' }
    ],
    createdAt: '2026-10-21T10:00:00Z',
    updatedAt: '2026-10-23T17:05:00Z'
  },
  {
    id: 'book-007',
    referenceNumber: 'RES-2026-2003',
    bookingType: 'reservation',
    status: 'Collected',
    customerName: 'Devendra Patel',
    customerPhone: '9898789012',
    customerEmail: 'devendra.patel@example.in',
    customerId: 'cust-007',
    reservedItems: [
      {
        productId: 'prod-003',
        productName: 'Aviator Classic Polarized',
        variantId: 'var-003-1',
        variantSku: 'RB-3025-GLD-GRN-58',
        colorName: 'Polished Gold / G-15 Green',
        size: 'Standard (58-14-135)',
        quantity: 1,
        unitPrice: 9490,
      }
    ],
    pickupWindowStart: '2026-10-22T10:00:00Z',
    pickupWindowEnd: '2026-10-25T20:00:00Z',
    notes: 'Collected and paid at checkout invoice INV-2026-00018.',
    timeline: [
      { status: 'Confirmed', timestamp: '2026-10-22T09:00:00Z', actor: 'Store Manager' },
      { status: 'Ready for pickup', timestamp: '2026-10-22T11:00:00Z', actor: 'Store Manager' },
      { status: 'Collected', timestamp: '2026-10-23T18:20:00Z', note: 'Picked up by customer, billing completed', actor: 'Cashier (Aman)' }
    ],
    createdAt: '2026-10-22T09:00:00Z',
    updatedAt: '2026-10-23T18:20:00Z'
  },
  {
    id: 'book-008',
    referenceNumber: 'APT-2026-1005',
    bookingType: 'appointment',
    status: 'Confirmed',
    customerName: 'Ishaan Kapoor (Parent: Shalini)',
    customerPhone: '9810890123',
    customerEmail: 'ishaan.kapoor@example.in',
    customerId: 'cust-008',
    appointmentPurpose: 'Comprehensive Eye Exam',
    appointmentDate: '2026-10-24',
    timeSlot: '05:00 PM - 05:45 PM',
    assignedOptometrist: 'Dr. Rajesh Khanna, M.S. Ophth',
    notes: 'Paediatric follow-up check for Hoya MiYOSMART progression check.',
    timeline: [
      { status: 'Confirmed', timestamp: '2026-10-20T14:00:00Z', note: 'Confirmed with parent Shalini Kapoor', actor: 'Front Desk' }
    ],
    createdAt: '2026-10-20T14:00:00Z',
    updatedAt: '2026-10-20T14:00:00Z'
  },
  {
    id: 'book-009',
    referenceNumber: 'RES-2026-2004',
    bookingType: 'reservation',
    status: 'Expired',
    customerName: 'Aditya Verma',
    customerPhone: '9820234567',
    customerEmail: 'aditya.verma@example.in',
    customerId: 'cust-012',
    reservedItems: [
      {
        productId: 'prod-002',
        productName: 'Milano Acetate Square',
        variantId: 'var-002-1',
        variantSku: 'OC-AC204-HAV-M',
        colorName: 'Dark Havana Tortoise',
        size: 'Medium (53-18-145)',
        quantity: 1,
        unitPrice: 3899,
      }
    ],
    pickupWindowStart: '2026-10-18T10:00:00Z',
    pickupWindowEnd: '2026-10-21T20:00:00Z',
    notes: '3-day reservation hold elapsed without pickup. Stock returned to available floor.',
    timeline: [
      { status: 'Confirmed', timestamp: '2026-10-18T10:00:00Z', actor: 'Store Manager' },
      { status: 'Ready for pickup', timestamp: '2026-10-18T12:00:00Z', actor: 'Inventory' },
      { status: 'Expired', timestamp: '2026-10-21T21:00:00Z', note: 'Automatic expiration trigger executed', actor: 'System Scheduler' }
    ],
    createdAt: '2026-10-18T10:00:00Z',
    updatedAt: '2026-10-21T21:00:00Z'
  },
  {
    id: 'book-010',
    referenceNumber: 'APT-2026-1006',
    bookingType: 'appointment',
    status: 'Cancelled',
    customerName: 'Tanvi Bose',
    customerPhone: '9830345678',
    customerEmail: 'tanvi.bose@example.in',
    customerId: 'cust-013',
    appointmentPurpose: 'Lens Adjustment & Repair',
    appointmentDate: '2026-10-24',
    timeSlot: '03:30 PM - 04:15 PM',
    notes: 'Customer notified travel delay out of city.',
    timeline: [
      { status: 'Confirmed', timestamp: '2026-10-22T12:00:00Z', actor: 'Front Desk' },
      { status: 'Cancelled', timestamp: '2026-10-23T18:00:00Z', note: 'Customer called to cancel due to emergency flight', actor: 'Front Desk (Simran)' }
    ],
    createdAt: '2026-10-22T12:00:00Z',
    updatedAt: '2026-10-23T18:00:00Z'
  },
  {
    id: 'book-011',
    referenceNumber: 'RES-2026-2005',
    bookingType: 'reservation',
    status: 'Pending',
    customerName: 'Zara Qureshi',
    customerPhone: '9820567891',
    customerEmail: 'zara.qureshi@example.in',
    customerId: 'cust-015',
    reservedItems: [
      {
        productId: 'prod-013',
        productName: 'Cat-Eye Sculpt Acetate',
        variantId: 'var-013-1',
        variantSku: 'OC-CE303-BUR-M',
        colorName: 'Deep Burgundy Wine',
        size: 'Medium (52-17-142)',
        quantity: 1,
        unitPrice: 3499,
      }
    ],
    pickupWindowStart: '2026-10-25T11:00:00Z',
    pickupWindowEnd: '2026-10-28T20:00:00Z',
    notes: 'Requested online. Waiting for stock confirmation.',
    timeline: [
      { status: 'Pending', timestamp: '2026-10-24T06:50:00Z', note: 'New reservation submitted', actor: 'Zara Qureshi (Customer)' }
    ],
    createdAt: '2026-10-24T06:50:00Z',
    updatedAt: '2026-10-24T06:50:00Z'
  },
  {
    id: 'book-012',
    referenceNumber: 'APT-2026-1007',
    bookingType: 'appointment',
    status: 'Confirmed',
    customerName: 'Meera Chopra',
    customerPhone: '9818123456',
    customerEmail: 'meera.c@example.in',
    customerId: 'cust-011',
    appointmentPurpose: 'Comprehensive Eye Exam',
    appointmentDate: '2026-10-26',
    timeSlot: '06:00 PM - 06:45 PM',
    assignedOptometrist: 'Dr. Neha Kulkarni, M.Optom',
    notes: 'Executive evening appointment slot requested.',
    timeline: [
      { status: 'Confirmed', timestamp: '2026-10-23T15:00:00Z', note: 'Booking confirmed by receptionist', actor: 'Front Desk' }
    ],
    createdAt: '2026-10-23T15:00:00Z',
    updatedAt: '2026-10-23T15:00:00Z'
  }
];
