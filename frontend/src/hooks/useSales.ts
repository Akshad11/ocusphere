import { useState, useEffect, useCallback } from 'react';
import { Sale, SaleReturn } from '../types/sales.types';
import { CreateSaleInput, mockSalesService } from '../services/mockSalesService';
import { mockStore } from '../services/mockApiClient';

export function useSales(params?: { search?: string; status?: string; paymentMethod?: string; date?: string }) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [returns, setReturns] = useState<SaleReturn[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [sList, rList] = await Promise.all([
        mockSalesService.list(params),
        mockSalesService.listReturns(),
      ]);
      setSales(sList);
      setReturns(rList);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch sales');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchSales();
    const unsubscribe = mockStore.subscribe(() => {
      fetchSales();
    });
    return unsubscribe;
  }, [fetchSales]);

  const createSale = async (input: CreateSaleInput) => {
    return await mockSalesService.createSale(input);
  };

  const processReturn = async (
    saleId: string,
    refundMethod: 'Cash' | 'UPI' | 'Card' | 'Split' | 'Other',
    items: Array<{
      saleItemId: string;
      variantId: string;
      returnedQuantity: number;
      reason: 'Fitting Issue' | 'Prescription Mismatch' | 'Defect' | 'Customer Changed Mind' | 'Other';
      restockStock: boolean;
    }>,
    processedBy?: string
  ) => {
    return await mockSalesService.processReturn(saleId, refundMethod, items, processedBy);
  };

  return {
    sales,
    returns,
    loading,
    error,
    refresh: fetchSales,
    createSale,
    processReturn,
  };
}

export function useSale(id: string) {
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSale = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const s = await mockSalesService.getById(id);
      setSale(s);
    } catch (err: any) {
      setError(err?.message || 'Sale invoice not found');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSale();
    const unsubscribe = mockStore.subscribe(() => {
      fetchSale();
    });
    return unsubscribe;
  }, [fetchSale]);

  return { sale, loading, error, refresh: fetchSale };
}
