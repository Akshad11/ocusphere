import { useState, useEffect, useCallback } from 'react';
import { Coupon, Offer } from '../types/offer.types';
import { mockOfferService } from '../services/mockOfferService';
import { mockStore } from '../services/mockApiClient';

export function useOffers(params?: { search?: string; isActive?: boolean }) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [oList, cList] = await Promise.all([
        mockOfferService.listOffers(params),
        mockOfferService.listCoupons(params),
      ]);
      setOffers(Array.isArray(oList) ? oList : (oList as any)?.items || []);
      setCoupons(Array.isArray(cList) ? cList : (cList as any)?.items || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load offers');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchOffers();
    const unsubscribe = mockStore.subscribe(() => {
      fetchOffers();
    });
    return unsubscribe;
  }, [fetchOffers]);

  const createOffer = async (input: Omit<Offer, 'id' | 'usedCount' | 'createdAt'>) => {
    return await mockOfferService.createOffer(input);
  };

  const updateOffer = async (id: string, input: Partial<Offer>) => {
    return await mockOfferService.updateOffer(id, input);
  };

  const createCoupon = async (input: Omit<Coupon, 'id' | 'usedCount' | 'createdAt'>) => {
    return await mockOfferService.createCoupon(input);
  };

  const validateCoupon = async (code: string, subtotal: number, categoryList?: string[]) => {
    return await mockOfferService.validateCoupon(code, subtotal, categoryList);
  };

  return {
    offers: Array.isArray(offers) ? offers : [],
    coupons: Array.isArray(coupons) ? coupons : [],
    loading,
    error,
    refresh: fetchOffers,
    createOffer,
    updateOffer,
    createCoupon,
    validateCoupon,
  };
}
