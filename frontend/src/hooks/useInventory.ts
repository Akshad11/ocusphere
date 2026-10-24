import { useState, useEffect, useCallback } from 'react';
import { InventoryItemRow, mockInventoryService } from '../services/mockInventoryService';
import { StockAdjustmentInput, StockMovement, StockRequest, StocktakeSession } from '../types/inventory.types';
import { mockStore } from '../services/mockApiClient';

export function useInventory(params?: { search?: string; stockStatus?: string; productType?: string }) {
  const [stockRows, setStockRows] = useState<InventoryItemRow[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [requests, setRequests] = useState<StockRequest[]>([]);
  const [stocktakes, setStocktakes] = useState<StocktakeSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [sList, mList, rList, stList] = await Promise.all([
        mockInventoryService.listStock(params),
        mockInventoryService.getMovements(),
        mockInventoryService.getStockRequests(),
        mockInventoryService.getStocktakes(),
      ]);
      setStockRows(sList);
      setMovements(mList);
      setRequests(rList);
      setStocktakes(stList);
    } catch (err: any) {
      setError(err?.message || 'Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchInventory();
    const unsubscribe = mockStore.subscribe(() => {
      fetchInventory();
    });
    return unsubscribe;
  }, [fetchInventory]);

  const adjustStock = async (input: StockAdjustmentInput, performedBy?: string) => {
    return await mockInventoryService.adjustStock(input, performedBy);
  };

  const createStockRequest = async (input: Omit<StockRequest, 'id' | 'requestNumber' | 'createdAt' | 'updatedAt'>) => {
    return await mockInventoryService.createStockRequest(input);
  };

  const updateRequestStatus = async (
    id: string,
    status: StockRequest['status'],
    approverNotes?: string,
    approvedBy?: string
  ) => {
    return await mockInventoryService.updateStockRequestStatus(id, status, approverNotes, approvedBy);
  };

  const saveStocktake = async (session: StocktakeSession) => {
    return await mockInventoryService.saveStocktake(session);
  };

  return {
    stockRows,
    movements,
    requests,
    stocktakes,
    loading,
    error,
    refresh: fetchInventory,
    adjustStock,
    createStockRequest,
    updateRequestStatus,
    saveStocktake,
  };
}
