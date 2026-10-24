import { useState, useEffect, useCallback } from 'react';
import { CreateCustomerInput, Customer, OpticalPrescription } from '../types/customer.types';
import { mockCustomerService } from '../services/mockCustomerService';
import { mockStore } from '../services/mockApiClient';

export function useCustomers(params?: { search?: string; page?: number; pageSize?: number }) {
  const [data, setData] = useState<{ items: Customer[]; total: number; page: number; pageSize: number; totalPages: number }>({
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await mockCustomerService.list(params);
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchCustomers();
    const unsubscribe = mockStore.subscribe(() => {
      fetchCustomers();
    });
    return unsubscribe;
  }, [fetchCustomers]);

  const createCustomer = async (input: CreateCustomerInput) => {
    return await mockCustomerService.create(input);
  };

  const updateCustomer = async (id: string, input: Partial<CreateCustomerInput>) => {
    return await mockCustomerService.update(id, input);
  };

  return {
    ...data,
    customers: data.items,
    loading,
    error,
    refresh: fetchCustomers,
    createCustomer,
    updateCustomer,
  };
}

export function useCustomer(id: string) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomer = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const c = await mockCustomerService.getById(id);
      setCustomer(c);
    } catch (err: any) {
      setError(err?.message || 'Customer not found');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCustomer();
    const unsubscribe = mockStore.subscribe(() => {
      fetchCustomer();
    });
    return unsubscribe;
  }, [fetchCustomer]);

  const addPrescription = async (prescription: Omit<OpticalPrescription, 'id' | 'customerId'>) => {
    if (!customer) return;
    const res = await mockCustomerService.addPrescription(customer.id, prescription);
    await fetchCustomer();
    return res;
  };

  return { customer, loading, error, refresh: fetchCustomer, addPrescription };
}
