import { useState, useEffect, useCallback } from 'react';
import { Supplier, CreateSupplierInput } from '../types/supplier.types';
import { GoodsReceipt, PurchaseOrder } from '../types/purchasing.types';
import { ConfirmGoodsReceiptInput, CreatePurchaseOrderInput, mockPurchaseOrderService } from '../services/mockPurchaseOrderService';
import { mockSupplierService } from '../services/mockSupplierService';
import { mockStore } from '../services/mockApiClient';

export function useSuppliers(params?: { search?: string; isActive?: boolean }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await mockSupplierService.list(params);
      setSuppliers(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchSuppliers();
    const unsubscribe = mockStore.subscribe(() => {
      fetchSuppliers();
    });
    return unsubscribe;
  }, [fetchSuppliers]);

  const createSupplier = async (input: CreateSupplierInput) => {
    return await mockSupplierService.create(input);
  };

  const updateSupplier = async (id: string, input: Partial<CreateSupplierInput>) => {
    return await mockSupplierService.update(id, input);
  };

  return { suppliers, loading, error, refresh: fetchSuppliers, createSupplier, updateSupplier };
}

export function usePurchaseOrders(params?: { search?: string; status?: string; supplierId?: string }) {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceipt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPOs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [pos, grns] = await Promise.all([
        mockPurchaseOrderService.list(params),
        mockPurchaseOrderService.listGoodsReceipts(),
      ]);
      setPurchaseOrders(pos);
      setGoodsReceipts(grns);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch purchase orders');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchPOs();
    const unsubscribe = mockStore.subscribe(() => {
      fetchPOs();
    });
    return unsubscribe;
  }, [fetchPOs]);

  const createPurchaseOrder = async (input: CreatePurchaseOrderInput) => {
    return await mockPurchaseOrderService.create(input);
  };

  const confirmReceipt = async (input: ConfirmGoodsReceiptInput) => {
    return await mockPurchaseOrderService.confirmGoodsReceipt(input);
  };

  return {
    purchaseOrders,
    goodsReceipts,
    loading,
    error,
    refresh: fetchPOs,
    createPurchaseOrder,
    confirmReceipt,
  };
}
