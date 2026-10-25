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
      if (Array.isArray(res)) {
        setData({
          items: res,
          total: res.length,
          page: 1,
          pageSize: res.length,
          totalPages: 1,
        });
      } else if (res && Array.isArray(res.items)) {
        setData(res);
      } else {
        setData({
          items: [],
          total: 0,
          page: 1,
          pageSize: 12,
          totalPages: 1,
        });
      }
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
    products: data?.items || [],
    loading,
    error,
    refresh: fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}

export function useProduct(idOrSlug: string, isSlug?: boolean) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!idOrSlug) {
      setLoading(false);
      setError('Product identifier not provided');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
      let p: Product;
      if (isSlug === true) {
        try {
          p = await mockProductService.getBySlug(idOrSlug);
        } catch {
          p = await mockProductService.getById(idOrSlug);
        }
      } else if (isSlug === false && !isUuid) {
        try {
          p = await mockProductService.getBySlug(idOrSlug);
        } catch {
          p = await mockProductService.getById(idOrSlug);
        }
      } else {
        if (isUuid) {
          try {
            p = await mockProductService.getById(idOrSlug);
          } catch {
            p = await mockProductService.getBySlug(idOrSlug);
          }
        } else {
          try {
            p = await mockProductService.getBySlug(idOrSlug);
          } catch {
            p = await mockProductService.getById(idOrSlug);
          }
        }
      }
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
