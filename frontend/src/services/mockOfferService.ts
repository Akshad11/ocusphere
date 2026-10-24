import { Coupon, Offer } from '../types/offer.types';
import { mockStore, simulateNetwork } from './mockApiClient';

export interface CouponValidationResult {
  isValid: boolean;
  message: string;
  discountAmount: number;
  offer?: Offer;
  coupon?: Coupon;
}

export interface OfferService {
  listOffers(params?: { isActive?: boolean; search?: string }): Promise<Offer[]>;
  getOfferById(id: string): Promise<Offer>;
  createOffer(input: Omit<Offer, 'id' | 'usedCount' | 'createdAt'>): Promise<Offer>;
  updateOffer(id: string, input: Partial<Offer>): Promise<Offer>;
  listCoupons(params?: { search?: string; isActive?: boolean }): Promise<Coupon[]>;
  createCoupon(input: Omit<Coupon, 'id' | 'usedCount' | 'createdAt'>): Promise<Coupon>;
  validateCoupon(code: string, subtotal: number, categoryList?: string[]): Promise<CouponValidationResult>;
}

class MockOfferServiceImpl implements OfferService {
  async listOffers(params = {} as { isActive?: boolean; search?: string }): Promise<Offer[]> {
    let list = [...mockStore.offers];
    if (params.isActive !== undefined) {
      list = list.filter((o) => o.isActive === params.isActive);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter((o) => o.name.toLowerCase().includes(q) || o.description.toLowerCase().includes(q));
    }
    return simulateNetwork(list);
  }

  async getOfferById(id: string): Promise<Offer> {
    const o = mockStore.offers.find((item) => item.id === id);
    if (!o) throw new Error(`Offer ${id} not found`);
    return simulateNetwork(o);
  }

  async createOffer(input: Omit<Offer, 'id' | 'usedCount' | 'createdAt'>): Promise<Offer> {
    const newOffer: Offer = {
      id: `off-${Date.now().toString().slice(-4)}`,
      ...input,
      usedCount: 0,
      createdAt: new Date().toISOString(),
    };
    mockStore.offers.unshift(newOffer);
    mockStore.save('offers', mockStore.offers);
    return simulateNetwork(newOffer);
  }

  async updateOffer(id: string, input: Partial<Offer>): Promise<Offer> {
    const idx = mockStore.offers.findIndex((o) => o.id === id);
    if (idx === -1) throw new Error(`Offer ${id} not found`);
    mockStore.offers[idx] = { ...mockStore.offers[idx], ...input };
    mockStore.save('offers', mockStore.offers);
    return simulateNetwork(mockStore.offers[idx]);
  }

  async listCoupons(params = {} as { search?: string; isActive?: boolean }): Promise<Coupon[]> {
    let list = [...mockStore.coupons];
    if (params.isActive !== undefined) {
      list = list.filter((c) => c.isActive === params.isActive);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter((c) => c.code.toLowerCase().includes(q) || c.offerName.toLowerCase().includes(q));
    }
    return simulateNetwork(list);
  }

  async createCoupon(input: Omit<Coupon, 'id' | 'usedCount' | 'createdAt'>): Promise<Coupon> {
    const newCoupon: Coupon = {
      id: `cp-${Date.now().toString().slice(-4)}`,
      ...input,
      code: input.code.toUpperCase().trim(),
      usedCount: 0,
      createdAt: new Date().toISOString(),
    };
    mockStore.coupons.unshift(newCoupon);
    mockStore.save('coupons', mockStore.coupons);
    return simulateNetwork(newCoupon);
  }

  async validateCoupon(code: string, subtotal: number, categoryList: string[] = []): Promise<CouponValidationResult> {
    const clean = code.trim().toUpperCase();
    const coupon = mockStore.coupons.find((c) => c.code.toUpperCase() === clean);

    if (!coupon) {
      return simulateNetwork({
        isValid: false,
        message: `Coupon "${code}" is invalid or does not exist.`,
        discountAmount: 0,
      });
    }

    if (!coupon.isActive) {
      return simulateNetwork({
        isValid: false,
        message: `Coupon "${code}" has been deactivated.`,
        discountAmount: 0,
      });
    }

    const now = new Date();
    if (new Date(coupon.expiryDate) < now) {
      return simulateNetwork({
        isValid: false,
        message: `Coupon "${code}" expired on ${coupon.expiryDate}.`,
        discountAmount: 0,
      });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return simulateNetwork({
        isValid: false,
        message: `Coupon "${code}" has reached its maximum global redemptions.`,
        discountAmount: 0,
      });
    }

    const offer = mockStore.offers.find((o) => o.id === coupon.offerId);
    if (!offer || !offer.isActive) {
      return simulateNetwork({
        isValid: false,
        message: `The promotion linked to this coupon is currently inactive.`,
        discountAmount: 0,
      });
    }

    if (subtotal < offer.minimumPurchase) {
      return simulateNetwork({
        isValid: false,
        message: `Minimum cart value of ₹${offer.minimumPurchase.toLocaleString('en-IN')} required for this coupon. Current: ₹${subtotal.toLocaleString('en-IN')}`,
        discountAmount: 0,
      });
    }

    if (offer.applicableCategory) {
      const matchCat = categoryList.some(
        (c) => c.toLowerCase() === offer.applicableCategory!.toLowerCase()
      );
      if (!matchCat && categoryList.length > 0) {
        return simulateNetwork({
          isValid: false,
          message: `Coupon only applies to items in category: ${offer.applicableCategory}.`,
          discountAmount: 0,
        });
      }
    }

    // Calculate discount
    let discount = 0;
    if (offer.discountType === 'Percentage') {
      discount = (subtotal * offer.discountValue) / 100;
      if (offer.maximumDiscount && discount > offer.maximumDiscount) {
        discount = offer.maximumDiscount;
      }
    } else {
      discount = offer.discountValue;
    }

    discount = Math.min(discount, subtotal);

    return simulateNetwork({
      isValid: true,
      message: `Coupon "${clean}" applied! ₹${discount.toLocaleString('en-IN')} saved.`,
      discountAmount: discount,
      offer,
      coupon,
    });
  }
}

import { apiOfferService } from './apiServices';

const isMock = (import.meta as any).env?.VITE_DATA_MODE === 'mock';
export const mockOfferService: OfferService = isMock ? new MockOfferServiceImpl() : (apiOfferService as any);
