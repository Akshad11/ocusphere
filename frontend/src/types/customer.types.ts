export interface EyePrescription {
  sph: string;
  cyl: string;
  axis: string;
  add?: string;
}

export interface OpticalPrescription {
  id: string;
  customerId: string;
  recordedDate: string;
  optometristName: string;
  clinicOrBranch: string;
  rightEye: EyePrescription; // OD
  leftEye: EyePrescription;  // OS
  pupillaryDistance: number; // PD in mm
  nearPd?: number;
  lensTypeRecommended?: string;
  coatingRecommended?: string;
  notes?: string;
}

export interface Customer {
  id: string;
  customerCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  contactPreferences: {
    sms: boolean;
    whatsapp: boolean;
    email: boolean;
    marketingConsent: boolean;
  };
  prescriptions: OpticalPrescription[];
  totalVisits: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  contactPreferences: {
    sms: boolean;
    whatsapp: boolean;
    email: boolean;
    marketingConsent: boolean;
  };
}
