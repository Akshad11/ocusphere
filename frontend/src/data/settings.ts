import { StoreSettings } from '../types/settings.types';

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'OcuSphere Optical Atelier & Clinic',
  tagline: 'Modern Precision Eyewear & Optometric Care',
  address: {
    line1: 'Ground Floor, 401 Turner Road, Bandra West',
    line2: 'Opposite Perry Cross Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400050',
    country: 'India',
  },
  phone: '+91 (022) 2640 8899',
  email: 'concierge@ocusphere.in',
  gstin: '27AABCO9918K1ZM',
  openingHours: {
    weekdays: '10:00 AM – 08:30 PM',
    saturday: '10:00 AM – 09:00 PM',
    sunday: '11:00 AM – 07:00 PM',
  },
  bookingCapacityPerHour: 4,
  reservationHoldDays: 3,
  currency: 'INR',
  currencySymbol: '₹',
  taxRatePercent: 12,
  receiptHeader: 'OCUSPHERE OPTICAL ATELIER\nGSTIN: 27AABCO9918K1ZM\nTel: +91 22 2640 8899',
  receiptFooter: 'Thank you for choosing OcuSphere!\n30-Day Frame Warranty · Free Ultrasonic Cleaning Anytime',
  enableSmsNotifications: true,
  enableWhatsappNotifications: true,
  enableEmailNotifications: true,
};
