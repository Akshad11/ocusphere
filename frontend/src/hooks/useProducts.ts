import { useState, useEffect, useCallback } from 'react';
import { CreateProductInput, Product, ProductListParams, UpdateProductInput } from '../types/product.types';
import { PaginatedResult } from '../types/common.types';
import { mockProductService } from '../services/mockProductService';
import { mockStore } from '../services/mockApiClient';

export function useProducts(params?: ProductListParams) {
  const [data, setData] = useState<PaginatedResult<Product>>({
    items: [],
    total: 0,
    page: 1,
    pageSize: 12,
    totalPages: 1,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await mockProductService.list(params || {});
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchProducts();
    const unsubscribe = mockStore.subscribe(() => {
      fetchProducts();
    });
    return unsubscribe;
  }, [fetchProducts]);

  const createProduct = async (input: CreateProductInput) => {
    return await mockProductService.create(input);
  };

  const updateProduct = async (id: string, input: UpdateProductInput) => {
    return await mockProductService.update(id, input);
  };

  const deleteProduct = async (id: string) => {
    return await mockProductService.delete(id);
  };

  return {
    ...data,
    products: data.items,
    loading,
    error,
    refresh: fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}

export function useProduct(idOrSlug: string, isSlug = false) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!idOrSlug) return;
    try {
      setLoading(true);
      setError(null);
      const p = isSlug
        ? await mockProductService.getBySlug(idOrSlug)
        : await mockProductService.getById(idOrSlug);
      setProduct(p);
    } catch (err: any) {
      setError(err?.message || 'Product not found');
    } finally {
      setLoading(false);
    }
  }, [idOrSlug, isSlug]);

  useEffect(() => {
    fetchProduct();
    const unsubscribe = mockStore.subscribe(() => {
      fetchProduct();
    });
    return unsubscribe;
  }, [fetchProduct]);

  return { product, loading, error, refresh: fetchProduct };
}
