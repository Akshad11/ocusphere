export type BookingType = 'appointment' | 'reservation';

export type BookingStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Arrived'
  | 'Preparing'
  | 'Ready for pickup'
  | 'Collected'
  | 'Completed'
  | 'Cancelled'
  | 'Expired';

export type AppointmentPurpose =
  | 'Comprehensive Eye Exam'
  | 'Contact Lens Consultation'
  | 'Frame Styling & Fitting'
  | 'Prescription Verification'
  | 'Lens Adjustment & Repair'
  | 'Follow-up Checkup';

export interface BookingTimelineEvent {
  status: BookingStatus;
  timestamp: string;
  note?: string;
  actor: string;
}

export interface ReservedProductItem {
  productId: string;
  productName: string;
  variantId: string;
  variantSku: string;
  colorName: string;
  size: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string;
}

export interface Booking {
  id: string;
  referenceNumber: string; // e.g. "APT-2026-1049" or "RES-2026-8841"
  bookingType: BookingType;
  status: BookingStatus;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerId?: string;
  // For appointments
  appointmentPurpose?: AppointmentPurpose;
  appointmentDate?: string; // YYYY-MM-DD
  timeSlot?: string;        // e.g. "10:30 AM - 11:15 AM"
  assignedOptometrist?: string;
  // For reservations
  reservedItems?: ReservedProductItem[];
  pickupWindowStart?: string;
  pickupWindowEnd?: string;
  notes?: string;
  timeline: BookingTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentInput {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  appointmentPurpose: AppointmentPurpose;
  appointmentDate: string;
  timeSlot: string;
  notes?: string;
}

export interface CreateReservationInput {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  productId: string;
  variantId: string;
  quantity: number;
  pickupDate: string;
  pickupSlot: string;
  notes?: string;
}
