import { CreateSupplierInput, Supplier } from '../types/supplier.types';
import { mockStore, simulateNetwork } from './mockApiClient';

export interface SupplierService {
  list(params?: { search?: string; isActive?: boolean }): Promise<Supplier[]>;
  getById(id: string): Promise<Supplier>;
  create(input: CreateSupplierInput): Promise<Supplier>;
  update(id: string, input: Partial<CreateSupplierInput>): Promise<Supplier>;
}

class MockSupplierServiceImpl implements SupplierService {
  async list(params = {} as { search?: string; isActive?: boolean }): Promise<Supplier[]> {
    let list = [...mockStore.suppliers];

    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (s) =>
          s.businessName.toLowerCase().includes(q) ||
          s.contactPerson.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q) ||
          s.taxId.toLowerCase().includes(q)
      );
    }

    if (params.isActive !== undefined) {
      list = list.filter((s) => s.isActive === params.isActive);
    }

    return simulateNetwork(list);
  }

  async getById(id: string): Promise<Supplier> {
    const s = mockStore.suppliers.find((item) => item.id === id);
    if (!s) throw new Error(`Supplier ${id} not found`);
    return simulateNetwork(s);
  }

  async create(input: CreateSupplierInput): Promise<Supplier> {
    const newSupp: Supplier = {
      id: `supp-${Date.now().toString().slice(-4)}`,
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockStore.suppliers.unshift(newSupp);
    mockStore.save('suppliers', mockStore.suppliers);
    return simulateNetwork(newSupp);
  }

  async update(id: string, input: Partial<CreateSupplierInput>): Promise<Supplier> {
    const idx = mockStore.suppliers.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error(`Supplier ${id} not found`);

    const updated = {
      ...mockStore.suppliers[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    };

    mockStore.suppliers[idx] = updated;
    mockStore.save('suppliers', mockStore.suppliers);
    return simulateNetwork(updated);
  }
}

import { apiSupplierService } from './apiServices';

const isMock = (import.meta as any).env?.VITE_DATA_MODE === 'mock';
export const mockSupplierService: SupplierService = isMock ? new MockSupplierServiceImpl() : apiSupplierService;
