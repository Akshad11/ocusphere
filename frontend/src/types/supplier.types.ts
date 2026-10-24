export interface Supplier {
  id: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  taxId: string; // GSTIN / Tax ID
  paymentTerms: 'Immediate' | 'Net 15' | 'Net 30' | 'Net 60';
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierInput {
  businessName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  taxId: string;
  paymentTerms: 'Immediate' | 'Net 15' | 'Net 30' | 'Net 60';
  isActive: boolean;
  notes?: string;
}
