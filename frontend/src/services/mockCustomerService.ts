import { CreateCustomerInput, Customer, OpticalPrescription } from '../types/customer.types';
import { PaginatedResult } from '../types/common.types';
import { mockStore, simulateNetwork } from './mockApiClient';

export interface CustomerService {
  list(params?: { search?: string; page?: number; pageSize?: number }): Promise<PaginatedResult<Customer>>;
  getById(id: string): Promise<Customer>;
  create(input: CreateCustomerInput): Promise<Customer>;
  update(id: string, input: Partial<CreateCustomerInput>): Promise<Customer>;
  addPrescription(customerId: string, prescription: Omit<OpticalPrescription, 'id' | 'customerId'>): Promise<OpticalPrescription>;
}

class MockCustomerServiceImpl implements CustomerService {
  async list(params = {} as { search?: string; page?: number; pageSize?: number }): Promise<PaginatedResult<Customer>> {
    let items = [...mockStore.customers];

    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (c) =>
          c.firstName.toLowerCase().includes(q) ||
          c.lastName.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.customerCode.toLowerCase().includes(q)
      );
    }

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const total = items.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const start = (page - 1) * pageSize;
    const paginated = items.slice(start, start + pageSize);

    return simulateNetwork({
      items: paginated,
      total,
      page,
      pageSize,
      totalPages,
    });
  }

  async getById(id: string): Promise<Customer> {
    const cust = mockStore.customers.find((c) => c.id === id);
    if (!cust) {
      throw new Error(`Customer ${id} not found`);
    }
    return simulateNetwork(cust);
  }

  async create(input: CreateCustomerInput): Promise<Customer> {
    const seq = mockStore.customers.length + 1001;
    const customerCode = `CUST-${seq}`;
    const newCust: Customer = {
      id: `cust-${Date.now().toString().slice(-4)}`,
      customerCode,
      ...input,
      prescriptions: [],
      totalVisits: 1,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockStore.customers.unshift(newCust);
    mockStore.save('customers', mockStore.customers);

    mockStore.auditLogs.unshift({
      id: `log-${Date.now()}`,
      actorName: 'Front Desk',
      actorRole: 'Store Assistant',
      action: 'CREATE',
      entity: 'Customer',
      entityId: newCust.customerCode,
      summary: `Registered new customer ${newCust.firstName} ${newCust.lastName} (${newCust.phone})`,
      timestamp: new Date().toISOString(),
    });
    mockStore.save('auditLogs', mockStore.auditLogs);

    return simulateNetwork(newCust);
  }

  async update(id: string, input: Partial<CreateCustomerInput>): Promise<Customer> {
    const idx = mockStore.customers.findIndex((c) => c.id === id);
    if (idx === -1) {
      throw new Error(`Customer ${id} not found`);
    }

    const updated: Customer = {
      ...mockStore.customers[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    };

    mockStore.customers[idx] = updated;
    mockStore.save('customers', mockStore.customers);
    return simulateNetwork(updated);
  }

  async addPrescription(
    customerId: string,
    prescription: Omit<OpticalPrescription, 'id' | 'customerId'>
  ): Promise<OpticalPrescription> {
    const cust = mockStore.customers.find((c) => c.id === customerId);
    if (!cust) {
      throw new Error(`Customer ${customerId} not found`);
    }

    const newRx: OpticalPrescription = {
      id: `rx-${Date.now()}`,
      customerId,
      ...prescription,
    };

    cust.prescriptions.unshift(newRx);
    cust.updatedAt = new Date().toISOString();
    mockStore.save('customers', mockStore.customers);

    mockStore.auditLogs.unshift({
      id: `log-${Date.now()}`,
      actorName: prescription.optometristName,
      actorRole: 'Store Manager',
      action: 'UPDATE',
      entity: 'Customer',
      entityId: cust.customerCode,
      summary: `Recorded new optical prescription for ${cust.firstName} ${cust.lastName} (PD: ${newRx.pupillaryDistance}mm)`,
      timestamp: new Date().toISOString(),
    });
    mockStore.save('auditLogs', mockStore.auditLogs);

    return simulateNetwork(newRx);
  }
}

import { apiCustomerService } from './apiServices';

const isMock = (import.meta as any).env?.VITE_DATA_MODE === 'mock';
export const mockCustomerService: CustomerService = isMock ? new MockCustomerServiceImpl() : apiCustomerService;
